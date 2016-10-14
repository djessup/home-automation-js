"use strict";

import $ from "jquery";
// import bootstrap from "bootstrap/js/bootstrap.js";
import "bootstrap/css/bootstrap.min.css!";
import "app/css/dashboard.css!";

import {Component, ComponentInstance, ComponentConfig} from "app/js/component";

export class App {

    constructor() {
        this.components = new Map();
    }

    /**
     * Register a new component
     * @param url the configuration URL for the component
     */
    register(url) {

        if (this.components.has(url)) {
            console.warn(`Already registered ${url}`);
        }

        $.getJSON(url).done((config) => {
            try {
                this._load(url, new ComponentConfig(config));
            } catch (e) {
                console.error(`Unable to register ${url}`, e);
            }
        }).fail((jqxhr, textStatus, error) => {
            console.error(`Failed to load component configuration from ${url}`, error);
        });

    }

    render() {
        return "hello world";
    }

    _load(url, componentConfig) {
        System.import(`app/js/plugins/${componentConfig.type.toLowerCase()}`).then((module) => {

            let component = module[componentConfig.type];

            if (component instanceof Component) {
                throw new TypeError(`${component.constructor.name} is not a Component`);
            }

            let theComponent = new component(componentConfig);
            let componentInstance = new ComponentInstance(theComponent, componentConfig, url)
            this.components.set(url, componentInstance);

            componentInstance.update();

            console.info(`Loaded ${componentConfig.type} (${componentConfig.name})`, theComponent);
        });
    }
}

export function run() {
    console.info("Running App...");
    return new App();
}