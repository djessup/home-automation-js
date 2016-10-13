"use strict";

import $ from "jquery";
// import bootstrap from "bootstrap/js/bootstrap.js";
import "bootstrap/css/bootstrap.min.css!";
import "app/css/dashboard.css!";

import {Component, ComponentConfig} from "app/js/component";

export class App {

    constructor() {
        this.components = new Array();
    }

    register(url) {
        $.getJSON(url, (config) => {
            let description;
            try {
                this._load(new ComponentConfig(config));
            } catch (e) {
                console.error(`Unable to register ${url}`, e);
            }

        });
    }

    render() {
        return "hello " + this.model;
    }

    _load(componentConfig) {

        System.import(`app/js/plugins/${componentConfig.type.toLowerCase()}`).then((module) => {
            let component = module[componentConfig.type];
            if (component instanceof Component) {
                throw new TypeError(`${component.constructor.name} is not a Component`);
            }
            let c = new component(componentConfig);
            this.components.push(c);
            console.info(`Loaded ${componentConfig.name} (${componentConfig.type})`, c);
        });
    }
}

export function run() {
    console.info("Running App...");
    return new App();
}