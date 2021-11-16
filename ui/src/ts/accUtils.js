/**
 * @license
 * Copyright (c) 2014, 2018, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/*
 * Your application specific code will go here
 */
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.announce = void 0;
    /**
     * Method for sending notifications to the aria-live region for Accessibility.
     * Sending a notice when the page is loaded, as well as changing the page title
     * is considered best practice for making Single Page Applications Accessbible.
     */
    let validAriaLiveValues = ["off", "polite", "assertive"];
    function announce(message, manner) {
        if (manner === undefined || validAriaLiveValues.indexOf(manner) === -1) {
            manner = "polite";
        }
        let params = {
            "bubbles": true,
            "detail": { "message": message, "manner": manner }
        };
        let globalBodyElement = document.getElementById("globalBody");
        globalBodyElement.dispatchEvent(new CustomEvent("announce", params));
    }
    exports.announce = announce;
});
