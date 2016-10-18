"use strict";

import $ from "jquery";
import { Component, ComponentConfig } from "app/js/component";
import hashCode from "app/js/hash-code.js";
import panelTmpl from "app/tmpl/component-panel.hbs!";
import "bootstrap/css/bootstrap.min.css!";
import "app/css/dashboard.css!";
import "app/css/grid.css!";
import "bricklayer";
import "bricklayer-jquery";
import "bricklayer/dist/bricklayer.css!";

/**
 * Main application class
 */
export class App {

    /**
     * Creates a new application instance.
     * @param {String|HTMLElement|jQuery} container The container element where components will be rendered. Can be an
     *     element, jQuery object, or a selector string resolvable by jQuery
     */
    constructor(container) {
        this._container = $(container);
        this._components = new Map();
        this._panels = new Map();
    }

    /**
     * Register a new component using it's configuration URL.
     * @param {String} url the configuration URL for the component
     * @return {Promise} Returns a promise that will resolve with the component instance once it is loaded
     */
    register(url) {
        const id = App.id(url);

        // Check if the component is already registered
        if (this._components.has(id)) {
            console.warn(`Already registered ${url}`);
            return Promise.reject();
        }

        // Since loading is async we "reserve" a spot in the component list so the list reflects the order components
        // were registered in, this way we can render them in the correct order.
        this._components.set(id, null);

        return new Promise((resolve, reject) => {

            // Load the component configuration
            $.getJSON(url).done((config) => {

                // Now we have the config, load the component module
                try {
                    const componentConfig = new ComponentConfig(id, url, config);
                    this._load(componentConfig).then((component) => {
                        resolve(component);
                    });
                } catch (e) {
                    // The config was invalid or the module could not be loaded, reject the promise, log the error, and
                    // un-reserve the component's spot in the register
                    console.error(`Unable to register ${url}`, e);
                    this._components.delete(id);
                    reject(e);
                }

            }).fail((jqxhr, textStatus, error) => {
                // The AJAX request failed, reject the promise, log the error, and un-reserve the component's spot in
                // the register
                console.error(`Failed to load component configuration from ${url}`, error);
                this._components.delete(id);
                reject(error);
            });
        });

    }

    /**
     * Removes a previously registered component.
     * @param {String} id the ID of the component to remove
     */
    remove(id) {

        // Check the component is actually registered
        if (!this._components.has(id)) {
            console.warn(`${id} is not registered`);
            return;
        }

        // Lookup the component
        const component = this._components.get(id);

        // Find the component's panel in the DOM
        const panel = this._getPanel(component.config);

        // Transition the panel out then cleanup any references and re-render the UI
        panel.fadeOut(() => {
            this._components.delete(id);
            this._panels.delete(id);
            this._render();
            console.info(`Removed ${component.config.type} (${component.config.name})`);
        });
    }

    /**
     * Renders all components and sets up the fluid grid (bricklayer)
     * @private
     */
    _render() {
        // Add the component panels to the DOM
        for (const component of this._components.values()) {
            if (component) {
                this._container.append(this._getPanel(component.config));
            }
        }

        // Remove any existing bricklayer grid instances
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
        // Components modules are expected to be stored in "app/js/components/<lowercase component type>"
        const moduleFile = config.type.toLowerCase();

        return new Promise((resolve, reject) => {
            // Load the component module using SystemJS
            System.import(`app/js/components/${moduleFile}`).then((module) => {

                // The component class is the "type" field from the config, and should be exported by the module
                const componentClazz = module[config.type];

                // Check the component class exists
                if (componentClazz === undefined) {
                    throw new TypeError(`Did not find component class ${config.type} in ${moduleFile}. Check the component class is properly named, and that it is exported by the module.`);
                }

                // Check the component class is descended from Component
                if (componentClazz instanceof Component) {
                    throw new TypeError(`${componentClazz.constructor.name} is not a Component`);
                }

                // Build the component panel
                const panel = this._getPanel(config);

                // Find the container where the component's view should be rendered
                const content = panel.find('.js-component-content').get(0);

                // Create the component instance
                const component = new componentClazz(content, config);

                // Save the component instance in the register
                this._components.set(config.id, component);

                // Start scheduled component updates
                component.update();

                // Re-render the app
                this._render();

                console.info(`Loaded ${config.type} (${config.name})`, component);

                // Resolve the promise with the new component instance
                resolve(component);

            }).catch(() => {
                // Reject the promise and provide the config of the failed component for reference
                reject(config);
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

    static id(url) {
        return `component-${hashCode(url)}`;
    }
}

/**
 * Starts the app by creating a new App instance
 * @param {String|HTMLElement|jQuery} container The container element where components will be rendered. Can be an
 *     element, jQuery object, or a selector string resolvable by jQuery
 * @return {App} Returns the application instance
 */
export function run(container) {
    console.info("Running App...");
    return new App(container);
}