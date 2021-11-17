import * as AccUtils from "../accUtils";
import * as ko from "knockout";
import ArrayDataProvider = require("ojs/ojarraydataprovider");
import {ColorAttributeGroupHandler} from "ojs/ojattributegrouphandler";
import "ojs/ojknockout";
import "ojs/ojdiagram";
import "ojs/ojformlayout";
import layout = require("../demoSankeyLayout");
import { ojDiagram } from "ojs/ojdiagram";

import { Client, createClient, SubscribePayload } from 'graphql-ws';
import { CountrySubscription, PurchaseSubscription } from "../models";

class IncidentsViewModel {

  client: Client;
  countrySubscription: AsyncGenerator<CountrySubscription, any, unknown>;
  purchaseSubscription: AsyncGenerator<PurchaseSubscription, any, unknown>;
  linkIndex = 0;
  
  private readonly nodes = ko.observableArray([]);
  private readonly links = ko.observableArray([]);
  private readonly countries = new Map<string, number>();
  private readonly purchases = new Map<string, number>();
  private readonly connections = new Map<string, number>();

  constructor() {
    this.client = createClient({
      url: 'ws://localhost:4000/graphql'
    });
  }

  /**
   * Optional ViewModel method invoked after the View is inserted into the
   * document DOM.  The application can put logic that requires the DOM being
   * attached here.
   * This method might be called multiple times - after the View is created
   * and inserted into the DOM and after the View is reconnected
   * after being disconnected.
   */
  connected(): void {
    AccUtils.announce("Incidents page loaded.");
    document.title = "Incidents";
    
    (async () => {
      this.countrySubscription = this.subscribe({
        query: 'subscription { fetchCountries { countryName population cca3 } }',
      });
    
      for await (const result of this.countrySubscription) {
        const country = result.fetchCountries.countryName;
        if (!this.countries.has(country)) {
          this.countries.set(country, this.nodes.push(
            this.createNode(country, [], false)
          ));
        }
      }
    })();

    (async () => {
      this.purchaseSubscription = this.subscribe({
        query: 'subscription { fetchPurchases { country category cost reference } }',
      });
    
      for await (const result of this.purchaseSubscription) {

        console.log(result.fetchPurchases.country);

        const purchase = result.fetchPurchases;
        const country = purchase.country;
        
        if (!this.countries.has(country)) {
          this.countries.set(country, this.nodes.push(
            this.createNode(country, [purchase], false)
          ));
        } else {
          const index = this.countries.get(country) - 1;
          const node = this.nodes()[index];
          node.details = node.details.concat([purchase]);
          node.title = `${country}: ${node.details.length} ${node.details.length === 1 ? 'purchase' : 'purchases'}`;
        }
          
        const category = purchase.category;

        if (!this.purchases.has(category)) {
          this.purchases.set(category, this.nodes.push(
            this.createNode(category, [purchase], true)
          ));
        } else {
          const index = this.purchases.get(category) - 1;
          const node = this.nodes()[index];
          node.details = node.details.concat([purchase]);
          node.title = `${category}: ${node.details.length} ${node.details.length === 1 ? 'purchase' : 'purchases'}`;
        }

        const connectionKey = `${country}:${category}`;

        if (!this.connections.has(connectionKey)) {
          this.connections.set(connectionKey, this.links.push(
            this.createLink(this.linkIndex++, connectionKey, [purchase])
          ));
        } else {
          const index = this.connections.get(connectionKey) - 1;
          const link = this.links()[index];
          link.details = link.details.concat([purchase]);
          const endpoints = connectionKey.split(":");
          link.title = `${endpoints[1]} bought ${link.details.length} ${link.details.length === 1 ? 'time' : 'times'} from ${endpoints[0]}`;
        }

      }
    })();

  }

  /**
   * Optional ViewModel method invoked after the View is disconnected from the DOM.
   */
  disconnected(): void {
    this.countrySubscription.return("");
    this.purchaseSubscription.return("");
  }

  /**
   * Optional ViewModel method invoked after transition to the new View is complete.
   * That includes any possible animation between the old and the new View.
   */
  transitionCompleted(): void {
    // implement if needed
  }

  createNode = (key: string, details: unknown[], isSink: boolean) => {
    const title = `${key}: ${details.length} ${details.length === 1 ? 'purchase' : 'purchases'}`;
    return {
      id: key.replace(/\s+/g, ""),
      label: key,
      title: title,
      details: details,
      isSink: isSink,
      colourAttribute: isSink ? 'node' : key
    };
  };

  createLink = (index: number, connection: string, details: unknown[]) => {
    console.log(index);
    const endpoints = connection.split(":");
    const title = `${endpoints[1]} bought ${details.length} ${details.length === 1 ? 'time' : 'times'} from ${endpoints[0]}`;
    return {
      id: "link_" + index,
      title: title,
      start: endpoints[0].replace(/\s+/g, ""),
      end: endpoints[1].replace(/\s+/g, ""),
      details: details,
      colourAttribute: endpoints[0]
    };
  };

  readonly colorHandler = new ColorAttributeGroupHandler();
  readonly layoutFunc = layout.layout;

  readonly nodeDataProvider = new ArrayDataProvider(this.nodes, {
    keyAttributes: "id",
  });

  readonly linkDataProvider = new ArrayDataProvider(this.links, {
    keyAttributes: "id",
  });

  readonly styleDefaults = {
    nodeDefaults: {
      icon: { width: 70, shape: "rectangle" },
    },
    linkDefaults: { svgStyle: { vectorEffect: "none", opacity: 0.4 } },
  };

  subscribe<T>(payload: SubscribePayload): AsyncGenerator<T> {
    let deferred: {
      resolve: (done: boolean) => void;
      reject: (err: unknown) => void;
    } | null = null;
    const pending: Array<T> = [];
    let throwMe: unknown = null,
      done = false;
    const dispose = this.client.subscribe<T>(payload, {
      next: (data) => {
        pending.push(data.data);
        deferred?.resolve(false);
      },
      error: (err) => {
        throwMe = err;
        deferred?.reject(throwMe);
      },
      complete: () => {
        done = true;
        deferred?.resolve(true);
      },
    });
    return {
      [Symbol.asyncIterator]() {
        return this;
      },
      async next() {
        if (done) return { done: true, value: undefined };
        if (throwMe) throw throwMe;
        if (pending.length) return { value: pending.shift()! };
        return (await new Promise<boolean>(
          (resolve, reject) => (deferred = { resolve, reject }),
        ))
          ? { done: true, value: undefined }
          : { value: pending.shift()! };
      },
      async throw(err) {
        throw err;
      },
      async return() {
        dispose();
        return { done: true, value: undefined };
      },
    };
  }

}

export = IncidentsViewModel;
