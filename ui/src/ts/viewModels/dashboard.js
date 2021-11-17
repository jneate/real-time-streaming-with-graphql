var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
define(["require", "exports", "../accUtils", "knockout", "ojs/ojarraydataprovider", "ojs/ojattributegrouphandler", "graphql-ws", "ojs/ojchart"], function (require, exports, AccUtils, ko, ArrayDataProvider, ojattributegrouphandler_1, graphql_ws_1) {
    "use strict";
    class DashboardViewModel {
        constructor() {
            this.allCountries = ko.observableArray([]);
            this.dataProvider = new ArrayDataProvider(this.allCountries, {
                'keyAttributes': 'cca3'
            });
            this.handler = new ojattributegrouphandler_1.ColorAttributeGroupHandler();
            this.client = graphql_ws_1.createClient({
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
        connected() {
            AccUtils.announce("Dashboard page loaded.");
            document.title = "Dashboard";
            // implement further logic if needed
            // this.allCountries.push({
            //   countryName: "test",
            //   population: 123,
            //   cca3: "GBR"
            // });
            (() => __awaiter(this, void 0, void 0, function* () {
                var e_1, _a;
                const subscription = this.subscribe({
                    query: 'subscription { fetchCountries { countryName population cca3 } }',
                });
                try {
                    // subscription.return() to dispose
                    for (var subscription_1 = __asyncValues(subscription), subscription_1_1; subscription_1_1 = yield subscription_1.next(), !subscription_1_1.done;) {
                        const result = subscription_1_1.value;
                        // next = result = { data: { greetings: 5x } }
                        console.log(result.fetchCountries.cca3);
                        this.allCountries.push(result.fetchCountries);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (subscription_1_1 && !subscription_1_1.done && (_a = subscription_1.return)) yield _a.call(subscription_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                // complete
            }))();
        }
        /**
         * Optional ViewModel method invoked after the View is disconnected from the DOM.
         */
        disconnected() {
            // implement if needed
        }
        /**
         * Optional ViewModel method invoked after transition to the new View is complete.
         * That includes any possible animation between the old and the new View.
         */
        transitionCompleted() {
            // implement if needed
        }
        getCountryColour(countryCode) {
            return this.handler.getValue(countryCode);
        }
        subscribe(payload) {
            let deferred = null;
            const pending = [];
            let throwMe = null, done = false;
            const dispose = this.client.subscribe(payload, {
                next: (data) => {
                    pending.push(data.data);
                    deferred === null || deferred === void 0 ? void 0 : deferred.resolve(false);
                },
                error: (err) => {
                    throwMe = err;
                    deferred === null || deferred === void 0 ? void 0 : deferred.reject(throwMe);
                },
                complete: () => {
                    done = true;
                    deferred === null || deferred === void 0 ? void 0 : deferred.resolve(true);
                },
            });
            return {
                [Symbol.asyncIterator]() {
                    return this;
                },
                next() {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (done)
                            return { done: true, value: undefined };
                        if (throwMe)
                            throw throwMe;
                        if (pending.length)
                            return { value: pending.shift() };
                        return (yield new Promise((resolve, reject) => (deferred = { resolve, reject })))
                            ? { done: true, value: undefined }
                            : { value: pending.shift() };
                    });
                },
                throw(err) {
                    return __awaiter(this, void 0, void 0, function* () {
                        throw err;
                    });
                },
                return() {
                    return __awaiter(this, void 0, void 0, function* () {
                        dispose();
                        return { done: true, value: undefined };
                    });
                },
            };
        }
    }
    return DashboardViewModel;
});
