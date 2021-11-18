import * as AccUtils from "../accUtils";
import * as ko from "knockout";
import ArrayDataProvider = require("ojs/ojarraydataprovider");
import {ColorAttributeGroupHandler} from "ojs/ojattributegrouphandler";
import "ojs/ojknockout";
import "ojs/ojdiagram";
import "ojs/ojpictochart";
import "ojs/ojlegend";
import "ojs/ojformlayout";
import layout = require("../demoSankeyLayout");
import { ojDiagram } from "ojs/ojdiagram";

import { Client, createClient, SubscribePayload } from 'graphql-ws';
import { CountrySubscription, Purchase, PurchaseSubscription } from "../models";

class IncidentsViewModel {

  categoriesDataProvider: ArrayDataProvider<ko.ObservableArray, { keyAttributes: string }>;
  countriesDataProvider: ArrayDataProvider<ko.ObservableArray, { keyAttributes: string }>;
  nodeDataProvider: ArrayDataProvider<ko.ObservableArray, { keyAttributes: string }>;
  linkDataProvider: ArrayDataProvider<ko.ObservableArray, { keyAttributes: string }>;
  
  private countrySubscription: AsyncGenerator<CountrySubscription, any, unknown>;
  private purchaseSubscription: AsyncGenerator<PurchaseSubscription, any, unknown>;
  private linkIndex = 0;

  private readonly client: Client;
  private readonly categories = ko.observableArray([]);
  private readonly countriesArray = ko.observableArray([]);
  private readonly nodes = ko.observableArray([]);
  private readonly links = ko.observableArray([]);
  private readonly countries = new Map<string, number>();
  private readonly purchases = new Map<string, number>();
  private readonly connections = new Map<string, number>();
  private readonly seenPurchases = new Map<string, Purchase>();

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
    
    this.categoriesDataProvider = new ArrayDataProvider(this.categories, {
      keyAttributes: "id",
    });
    
    this.countriesDataProvider = new ArrayDataProvider(this.countriesArray, {
      keyAttributes: "id",
    });
    
    this.nodeDataProvider = new ArrayDataProvider(this.nodes, {
      keyAttributes: "id",
    });
  
    this.linkDataProvider = new ArrayDataProvider(this.links, {
      keyAttributes: "id",
    });
    
    (async () => {
      this.countrySubscription = this.subscribe({
        query: 'subscription { fetchCountries { countryName population cca3 } }',
      });
    
      for await (const result of this.countrySubscription) {
        this.processCountry(result.fetchCountries.countryName);
      }
    })();

    (async () => {
      this.purchaseSubscription = this.subscribe({
        query: 'subscription { fetchPurchases { country category cost reference } }',
      });
    
      for await (const result of this.purchaseSubscription) {
        
        const purchase = result.fetchPurchases;
        const country = purchase.country;
        const category = purchase.category;
        const connectionKey = `${country}:${category}`;

        if (!this.seenPurchases.has(purchase.reference)) {
          this.seenPurchases.set(purchase.reference, purchase);
          this.processCountry(purchase.country, purchase);
          this.processPurchase(purchase.category, purchase);
          this.processConnection(connectionKey, purchase);
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

  processCountry(key: string, purchase?: Purchase): void {

    if (!this.countries.has(key)) {
      const node = this.createNode(key, purchase ? [purchase] : [], false);
      this.countries.set(key, this.nodes.push(node));
      this.countriesArray.push(node);
    } else if (purchase) {
      const index = this.countries.get(key) - 1;
      const node = this.nodes()[index];
      node.details = node.details.concat([purchase]);
      node.title = `${key}: ${node.details.length} ${node.details.length === 1 ? 'purchase' : 'purchases'}`;
      this.nodes.valueHasMutated();
      this.countriesArray.valueHasMutated();
    }

  }

  processPurchase(key: string, purchase: Purchase): void {
    
    if (!this.purchases.has(key)) {
      const node = this.createNode(key, [purchase], true);
      this.purchases.set(key, this.nodes.push(node));
      this.categories.push(node);
    } else {
      const index = this.purchases.get(key) - 1;
      const node = this.nodes()[index];
      node.details = node.details.concat([purchase]);
      node.title = `${key}: ${node.details.length} ${node.details.length === 1 ? 'purchase' : 'purchases'}`;
      this.nodes.valueHasMutated();
      this.categories.valueHasMutated();
    }

  }

  processConnection(key: string, purchase: Purchase): void {

    if (!this.connections.has(key)) {
      this.connections.set(key, this.links.push(
        this.createLink(this.linkIndex++, key, [purchase])
      ));
    } else {
      const index = this.connections.get(key) - 1;
      const link = this.links()[index];
      link.details = link.details.concat([purchase]);
      const endpoints = key.split(":");
      link.title = `${endpoints[1]} bought ${link.details.length} ${link.details.length === 1 ? 'time' : 'times'} from ${endpoints[0]}`;
      this.links.valueHasMutated();
    }

  }

  createNode = (key: string, details: unknown[], isSink: boolean) => {
    const title = `${key}: ${details.length} ${details.length === 1 ? 'purchase' : 'purchases'}`;
    return {
      id: key.replace(/\s+/g, ""),
      label: key,
      title: title,
      details: details,
      isSink: isSink,
      colourAttribute: key
    };
  };

  createLink = (index: number, connection: string, details: unknown[]) => {
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

  totalCost(purchases: Purchase[]): number {
    return purchases.reduce(function(previousValue, currentValue) {
      return previousValue + currentValue.cost
    }, 0);
  }

  // Hard coding the category colours to ensure they stand out from the countries
  readonly colorHandler = new ColorAttributeGroupHandler({
    'Personal Care': '#418CF0',
    'Furniture': '#DF3A02',
    'Outdoor': '#919191',
    'Electronics': '#1A3B69',
    'Toys': '#CD853F',
    'Clothing': '#2E8B57',
    'Media': '#F1B9A8',
    'Food': '#7893BE',
    'DIY': '#DDA0DD',
    'Travel': '#9ACD32'
  });
  readonly layoutFunc = layout.layout;

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
