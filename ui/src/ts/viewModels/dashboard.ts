import * as AccUtils from "../accUtils";
import * as ko from "knockout";
import ArrayDataProvider = require("ojs/ojarraydataprovider");
import {ColorAttributeGroupHandler} from "ojs/ojattributegrouphandler";
import "ojs/ojchart";

import { Client, createClient, SubscribePayload } from 'graphql-ws';
import { Country, CountrySubscription } from "../models";

class DashboardViewModel {

  allCountries: ko.ObservableArray;
  seenCountries: Map<string, Country>;
  dataProvider: ArrayDataProvider<string, Country>;
  colorHandler: ColorAttributeGroupHandler;
  client: Client;
  subscription: AsyncGenerator<CountrySubscription, any, unknown>;

  constructor() {
    this.allCountries = ko.observableArray([]);
    this.seenCountries = new Map();
    this.dataProvider = new ArrayDataProvider(this.allCountries, {
      'keyAttributes': 'cca3'
    });
    this.colorHandler = new ColorAttributeGroupHandler()
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
    AccUtils.announce("Dashboard page loaded.");
    document.title = "Dashboard";

    (async () => {
      this.subscription = this.subscribe({
        query: 'subscription { fetchCountries { countryName population cca3 } }',
      });

      for await (const result of this.subscription) {
        const country = result.fetchCountries;
        if (!this.seenCountries.has(country.countryName)) {
          this.seenCountries.set(country.countryName, country);
          this.allCountries.push(country);
        }
      }
    })();

  }

  /**
   * Optional ViewModel method invoked after the View is disconnected from the DOM.
   */
  disconnected(): void {
    this.subscription.return("");
  }

  /**
   * Optional ViewModel method invoked after transition to the new View is complete.
   * That includes any possible animation between the old and the new View.
   */
  transitionCompleted(): void {
    // implement if needed
  }

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

export = DashboardViewModel;
