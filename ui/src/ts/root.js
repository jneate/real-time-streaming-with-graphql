define(["require", "exports", "knockout", "ojs/ojbootstrap", "./appController", "ojs/ojknockout", "ojs/ojmodule", "ojs/ojnavigationlist", "ojs/ojbutton", "ojs/ojtoolbar"], function (require, exports, ko, ojbootstrap_1, appController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function init() {
        // bind your ViewModel for the content of the whole page body.
        ko.applyBindings(appController_1.default, document.getElementById("globalBody"));
    }
    ojbootstrap_1.whenDocumentReady().then(function () {
        // if running in a hybrid (e.g. Cordova) environment, we need to wait for the deviceready
        // event before executing any code that might interact with Cordova APIs or plugins.
        if (document.body.classList.contains("oj-hybrid")) {
            document.addEventListener("deviceready", init);
        }
        else {
            init();
        }
    });
});
