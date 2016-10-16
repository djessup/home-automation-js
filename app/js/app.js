"use strict";

import $ from "jquery";
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
        const id = App._id(url);

        if (this._components.has(id)) {
            console.warn(`Already registered ${url}`);
            return;
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

    remove(id) {

        if (!this._components.has(id)) {
            console.warn(`${id} is not registered`);
            return;
        }

        const component = this._components.get(id);
        const panel = this._getPanel(component.config);
        panel.fadeOut(() => {
            panel.remove();
            this._components.delete(id);
            console.info(`Removed ${component.config.type} (${component.config.name})`);
        });
    }

    /**
     * Loads component modules and triggers a new instance to be created and added to the dashboard
     * @param {String} url the component's configuration URL
     * @param {ComponentConfig} config the component's configuration
     * @private
     */
    _load(config) {
        const moduleFile = config.type.toLowerCase();
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

            console.info(`Loaded ${config.type} (${config.name})`, component);
        });
    }

    /**
     * Gets the panel for the provided component. If the panel doesn't exist it will be created and appended to the App's container.
     * @param {ComponentConfig} config the component to get the panel for
     * @returns {Object} jQuery
     * @private
     */
    _getPanel(config) {
        // Look for the panel in the container
        let panel = this._container.find(`#${config.id}`);

        // If no panel found, create one using the panel template and add it to the container
        if (panel.length === 0) {
            panel = $(panelTmpl({
                title: `${config.type} (${config.name})`,
                id: config.id
            }));

            this._container.append(panel);

            // Attach the remove button handler
            panel.find('.js-remove-button').click(() => {
                this.remove(config.id)
            });
        }

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