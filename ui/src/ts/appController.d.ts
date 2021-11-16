/// <reference types="ojcorerouter" />
/// <reference types="ojmodulerouter-adapter" />
/// <reference types="ojknockoutrouteradapter" />
import * as ko from "knockout";
import CoreRouter = require("ojs/ojcorerouter");
import ModuleRouterAdapter = require("ojs/ojmodulerouter-adapter");
import KnockoutRouterAdapter = require("ojs/ojknockoutrouteradapter");
import "ojs/ojknockout";
import "ojs/ojmodule-element";
import { ojNavigationList } from "ojs/ojnavigationlist";
interface CoreRouterDetail {
    label: string;
    iconClass: string;
}
declare class RootViewModel {
    manner: ko.Observable<string>;
    message: ko.Observable<string | undefined>;
    smScreen: ko.Observable<boolean>;
    mdScreen: ko.Observable<boolean>;
    router: CoreRouter<CoreRouterDetail>;
    moduleAdapter: ModuleRouterAdapter<CoreRouterDetail>;
    navDataProvider: ojNavigationList<string, CoreRouter.CoreRouterState<CoreRouterDetail>>["data"];
    drawerParams: {
        selector: string;
        content: string;
        edge?: "start" | "end" | "top" | "bottom";
        displayMode?: "push" | "overlay";
        autoDismiss?: "focusLoss" | "none";
        size?: string;
        modality?: "modal" | "modeless";
    };
    appName: ko.Observable<string>;
    userLogin: ko.Observable<string>;
    footerLinks: Array<object>;
    selection: KnockoutRouterAdapter<CoreRouterDetail>;
    constructor();
    announcementHandler: (event: any) => void;
    toggleDrawer: () => Promise<boolean>;
}
declare const _default: RootViewModel;
export default _default;
