import * as AccUtils from "../accUtils";
import * as ko from "knockout";
import * as $ from "jquery";
import ArrayDataProvider = require("ojs/ojarraydataprovider");
import {ColorAttributeGroupHandler} from "ojs/ojattributegrouphandler";
import "ojs/ojchart";

import { Country } from "../models";
class CustomersViewModel {

  allCountries: ko.ObservableArray;
  dataProvider: ArrayDataProvider<string, Country>;
  colorHandler: ColorAttributeGroupHandler;
  countryCodeArray: string[];

  constructor() {
    this.allCountries = ko.observableArray([]);
    this.dataProvider = new ArrayDataProvider(this.allCountries, {
      keyAttributes: "cca3"
    });
    this.colorHandler = new ColorAttributeGroupHandler();
    this.countryCodeArray = ["BRA","RUS","ZAF","GBR","IND","COL","ARE","CHN","AUS","SGP","DNK","USA"];
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
    AccUtils.announce("Customers page loaded.");
    document.title = "Customers";
    // Every 5 seconds make a call to Rest Countries and pull down the next 3 countries
    (async () => { 
      
      for (let i = 0; i < this.countryCodeArray.length; i = i + 3) {

        $.ajax({
          url: `https://restcountries.com/v3.1/alpha?fields=name,population,cca3&codes=${this.countryCodeArray.slice(i, i + 3).join(',')}`,
          method: "GET",
          dataType: "json",
          contentType: "application/json",
          timeout: 30000,
          success: (data, textStatus, xhr) => {
            console.log(data);
            for (let countryData of data) {
              this.allCountries.push({
                countryName: countryData.name.common,
                population: countryData.population,
                cca3: countryData.cca3
              });
            }
          },
          error: (xhr, textStatus, errorThrown) => {
            console.error(xhr);
          }
        });

        await new Promise(f => setTimeout(f, 5000));

      }

    })();
  }

  /**
   * Optional ViewModel method invoked after the View is disconnected from the DOM.
   */
  disconnected(): void {
    // implement if needed
  }

  /**
   * Optional ViewModel method invoked after transition to the new View is complete.
   * That includes any possible animation between the old and the new View.
   */
  transitionCompleted(): void {
    // implement if needed
  }
}

export = CustomersViewModel;
