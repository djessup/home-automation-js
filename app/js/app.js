"use strict";

import $ from "jquery";
// import bootstrap from "bootstrap/js/bootstrap.js";

import {Component, ComponentConfig} from "app/js/component";
import hashCode from "app/js/hash-code.js";

import panelTmpl from "app/templates/component-panel.hbs!";

import "bootstrap/css/bootstrap.min.css!";
import "app/css/dashboard.css!";


export class App {

    constructor(container) {
        this._container = $(container);
        this._components = new Map();
    }

    /**
     * Register a new component
     * @param url the configuration URL for the component
     */
    register(url) {
        const id = this._id(url);
        if (this._components.has(id)) {
            console.warn(`Already registered ${url}`);
        }

        $.getJSON(url).done((config) => {
            try {
                this._load(new ComponentConfig(id, url, config));
            } catch (e) {
                console.error(`Unable to register ${url}`, e);
            }
        }).fail((jqxhr, textStatus, error) => {
            console.error(`Failed to load component configuration from ${url}`, error);
        });
    }

    render() {
        for (const component in this._components.values()) {
            this._render(component);
        }
    }

    /**
     * Loads component modules and triggers a new instance to be created and added to the dashboard
     * @param url the component's configuration URL
     * @param config the component's configuration
     * @private
     */
    _load(config) {
        const moduleFile = config.type.toLowerCase();
        System.import(`app/js/components/${moduleFile}`).then((module) => {

            let componentClazz = module[config.type];

            if (componentClazz === undefined) {
                throw new TypeError(`Did not find component class ${config.type} in ${moduleFile}. Check the component class is properly named, and that it is exported by the module.`);
            }

            if (componentClazz instanceof Component) {
                throw new TypeError(`${componentClazz.constructor.name} is not a Component`);
            }

            let component = new componentClazz(config);
            this._components.set(config.id, component);

            // Start scheduled component updates
            component.update().done(() => {
                this._render(component);
            });

            console.info(`Loaded ${config.type} (${config.name})`, component);
        });
    }

    _render(component) {
        const panel = $(panelTmpl({
            title: `${component.config.type} (${component.config.name})`,
            id: component.id
        }));

        panel.find(".js-component-content").html(component.render());

        this._container.append(panel);
    }

    _id(url) {
        return `component${hashCode(url)}`;
    }
}

export function run(container) {
    console.info("Running App...");
    return new App(container);
}