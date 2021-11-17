import * as AccUtils from "../accUtils";
import * as ko from "knockout";
import ArrayDataProvider = require("ojs/ojarraydataprovider");

import { Client, createClient, SubscribePayload } from 'graphql-ws';
import { Country, CountrySubscription, Purchase, PurchaseSubscription } from "../models";

class IncidentsViewModel {

  allCountries: ko.ObservableArray;
  dataProvider: ArrayDataProvider<string, Country>;
  allPurchases: ko.ObservableArray;
  purchaseDataProvider: ArrayDataProvider<string, Purchase>;
  client: Client;
  countrySubscription: AsyncGenerator<CountrySubscription, any, unknown>;
  purchaseSubscription: AsyncGenerator<PurchaseSubscription, any, unknown>;

  constructor() {
    this.allCountries = ko.observableArray([]);
    this.dataProvider = new ArrayDataProvider(this.allCountries, {
      'keyAttributes': 'cca3'
    });
    this.allPurchases = ko.observableArray([]);
    this.purchaseDataProvider = new ArrayDataProvider(this.allPurchases, {
      'keyAttributes': 'reference'
    });
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
        console.log(result.fetchCountries.cca3);
        this.allCountries.push(result.fetchCountries);
      }
    })();

    (async () => {
      this.purchaseSubscription = this.subscribe({
        query: 'subscription { fetchPurchases { country category cost reference } }',
      });
    
      for await (const result of this.purchaseSubscription) {
        console.log(result.fetchPurchases.reference);
        this.allPurchases.push(result.fetchPurchases);
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
