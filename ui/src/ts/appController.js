define(["require", "exports", "knockout", "ojs/ojresponsiveutils", "ojs/ojresponsiveknockoututils", "ojs/ojoffcanvas", "ojs/ojcorerouter", "ojs/ojmodulerouter-adapter", "ojs/ojknockoutrouteradapter", "ojs/ojurlparamadapter", "ojs/ojarraydataprovider", "ojs/ojcontext", "ojs/ojknockout", "ojs/ojmodule-element"], function (require, exports, ko, ResponsiveUtils, ResponsiveKnockoutUtils, OffcanvasUtils, CoreRouter, ModuleRouterAdapter, KnockoutRouterAdapter, UrlParamAdapter, ArrayDataProvider, Context) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ;
    class RootViewModel {
        constructor() {
            this.announcementHandler = (event) => {
                this.message(event.detail.message);
                this.manner(event.detail.manner);
            };
            // called by navigation drawer toggle button and after selection of nav drawer item
            this.toggleDrawer = () => {
                return OffcanvasUtils.toggle(this.drawerParams);
            };
            // handle announcements sent when pages change, for Accessibility.
            this.manner = ko.observable("polite");
            this.message = ko.observable();
            let globalBodyElement = document.getElementById("globalBody");
            globalBodyElement.addEventListener("announce", this.announcementHandler, false);
            // media queries for repsonsive layouts
            let smQuery = ResponsiveUtils.getFrameworkQuery("sm-only");
            if (smQuery) {
                this.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
            }
            let mdQuery = ResponsiveUtils.getFrameworkQuery("md-up");
            if (mdQuery) {
                this.mdScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);
            }
            const navData = [
                { path: "", redirect: "dashboard" },
                { path: "dashboard", detail: { label: "Dashboard", iconClass: "oj-ux-ico-bar-chart" } },
                { path: "incidents", detail: { label: "Incidents", iconClass: "oj-ux-ico-fire" } },
                { path: "customers", detail: { label: "Customers", iconClass: "oj-ux-ico-contact-group" } },
                { path: "about", detail: { label: "About", iconClass: "oj-ux-ico-information-s" } }
            ];
            // router setup
            const router = new CoreRouter(navData, {
                urlAdapter: new UrlParamAdapter()
            });
            router.sync();
            this.moduleAdapter = new ModuleRouterAdapter(router);
            this.selection = new KnockoutRouterAdapter(router);
            // Setup the navDataProvider with the routes, excluding the first redirected
            // route.
            this.navDataProvider = new ArrayDataProvider(navData.slice(1), { keyAttributes: "path" });
            // drawer
            this.drawerParams = {
                displayMode: "push",
                selector: "#navDrawer",
                content: "#pageContent"
            };
            // close offcanvas on medium and larger screens
            this.mdScreen.subscribe(() => {
                OffcanvasUtils.close(this.drawerParams);
            });
            // add a close listener so we can move focus back to the toggle button when the drawer closes
            let navDrawerElement = document.querySelector("#navDrawer");
            navDrawerElement.addEventListener("ojclose", () => {
                let drawerToggleButtonElment = document.querySelector("#drawerToggleButton");
                drawerToggleButtonElment.focus();
            });
            // header
            // application Name used in Branding Area
            this.appName = ko.observable("App Name");
            // user Info used in Global Navigation area
            this.userLogin = ko.observable("john.hancock@oracle.com");
            // footer
            this.footerLinks = [
                { name: 'About Oracle', linkId: 'aboutOracle', linkTarget: 'http://www.oracle.com/us/corporate/index.html#menu-about' },
                { name: "Contact Us", id: "contactUs", linkTarget: "http://www.oracle.com/us/corporate/contact/index.html" },
                { name: "Legal Notices", id: "legalNotices", linkTarget: "http://www.oracle.com/us/legal/index.html" },
                { name: "Terms Of Use", id: "termsOfUse", linkTarget: "http://www.oracle.com/us/legal/terms/index.html" },
                { name: "Your Privacy Rights", id: "yourPrivacyRights", linkTarget: "http://www.oracle.com/us/legal/privacy/index.html" },
            ];
            // release the application bootstrap busy state
            Context.getPageContext().getBusyContext().applicationBootstrapComplete();
        }
    }
    exports.default = new RootViewModel();
});
