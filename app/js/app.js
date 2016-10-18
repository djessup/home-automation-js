"use strict";

import $ from "jquery";
import { Component, ComponentConfig } from "app/js/component";
import hashCode from "app/js/hash-code.js";
import panelTmpl from "app/tmpl/component-panel.hbs!";
import "bootstrap/css/bootstrap.min.css!";
import bootstrap from "bootstrap/js/bootstrap.js";
import "app/css/dashboard.css!";
import "app/css/grid.css!";
import "bricklayer";
import "bricklayer-jquery";
import "bricklayer/dist/bricklayer.css!";

/**
 * Main application class
 */
export class App {

    constructor(container) {
        this._container = $(container);
        this._components = new Map();
        this._panels = new Map();
    }

    /**
     * Register a new component using it's configuration URL.
     *
     * @param url the configuration URL for the component
     */
    register(url) {
        const id = App._id(url);

        if (this._components.has(id)) {
            console.warn(`Already registered ${url}`);
            return Promise.reject();
        }

        // Reserve a spot for the component once it's loaded, so components are rendered in the order they are
        // registered in
        this._components.set(id, null);

        return new Promise((resolve, reject) => {
            $.getJSON(url).done((config) => {
                try {
                    this._load(new ComponentConfig(id, url, config)).then((component) => {
                        resolve(component);
                    });
                } catch (e) {
                    console.error(`Unable to register ${url}`, e);
                    reject(e);
                }
            }).fail((jqxhr, textStatus, error) => {
                console.error(`Failed to load component configuration from ${url}`, error);
                reject(error);
            });
        });

    }

    remove(id) {

        if (!this._components.has(id)) {
            console.warn(`${id} is not registered`);
            return;
        }

        const component = this._components.get(id);
        const panel = this._getPanel(component.config);
        panel.fadeOut(() => {
            this._components.delete(id);
            this._panels.delete(id);
            this._render();
            console.info(`Removed ${component.config.type} (${component.config.name})`);
        });
    }

    _render() {
        // Add the component panels to the DOM
        for (const component of this._components.values()) {
            if (component) {
                this._container.append(this._getPanel(component.config));
            }
        }

        // Remove any existing bricklayer instances
        const bricklayer = this._container.data('bricklayer');
        if (bricklayer !== undefined) {
            this._container.data('bricklayer').destroy();
        }

        // (Re)initialise the bricklayer grid layout
        this._container.bricklayer();
    }

    /**
     * Loads component modules and triggers a new instance to be created and added to the dashboard.
     * @param {ComponentConfig} config the component's configuration
     * @return {Promise} Returns a promise which will be resolved with the component instance once loaded.
     * @private
     */
    _load(config) {
        const moduleFile = config.type.toLowerCase();
        return new Promise((resolve, reject) => {
            System.import(`app/js/components/${moduleFile}`).then((module) => {
                const componentClazz = module[config.type];

                if (componentClazz === undefined) {
                    throw new TypeError(`Did not find component class ${config.type} in ${moduleFile}. Check the component class is properly named, and that it is exported by the module.`);
                }

                if (componentClazz instanceof Component) {
                    throw new TypeError(`${componentClazz.constructor.name} is not a Component`);
                }

                const panel = this._getPanel(config);
                const content = panel.find('.js-component-content').get(0);
                const component = new componentClazz(content, config);

                this._components.set(config.id, component);

                // Start scheduled component updates
                component.update();

                this._render();

                console.info(`Loaded ${config.type} (${config.name})`, component);

                resolve(component);
            }).catch(() => {
                reject();
            });
        });
    }

    /**
     * Gets the panel for the provided component. If the panel doesn't exist it will be created and appended to the
     * App's container.
     * @param {ComponentConfig} config the component to get the panel for
     * @returns {Object} jQuery
     * @private
     */
    _getPanel(config) {
        // Look for the panel in the container
        if (this._panels.has(config.id)) {
            return this._panels.get(config.id);
        }

        // If no panel found, create one using the panel template and add it to the container
        const panel = $(panelTmpl({
            title: `${config.type} (${config.name})`,
            id: config.id
        }));

        // Attach the remove button handler
        panel.find('.js-remove-button').click(() => {
            this.remove(config.id)
        });

        this._panels.set(config.id, panel);

        return panel;
    }

    static _id(url) {
        return `component-${hashCode(url)}`;
    }
}

export function run(container) {
    console.info("Running App...");
    return new App(container);
}