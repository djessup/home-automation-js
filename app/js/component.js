"use strict";

import $ from "jquery";
import hashCode from "app/js/hash-code.js";

class ComponentConfig {
    constructor(id, url, config) {

        // Check the URL was provided
        if (id === undefined || id === "") {
            throw new TypeError("No component ID provided");
        }

        // Check the URL was provided
        if (url === undefined || url === "") {
            throw new TypeError("No configuration URL provided");
        }

        // Check the config object was provided
        if (config === undefined) {
            throw new TypeError("No configuration object was provided");
        }

        // Check "type" property is present
        if (config.type === undefined || config.type === "") {
            throw new TypeError("Component description is missing the \"type\" property.");
        }

        // Check "name" property is present
        if (config.name === undefined || config.name === "") {
            throw new TypeError("Component description is missing the \"name\" property.");
        }

        // Check "status" property is present
        if (config.status === undefined || config.status === "") {
            throw new TypeError("Component description is missing the \"status\" property.");
        }

        this._id = id;
        this._url = url;
        this._type = config.type;
        this._name = config.name;
        this._description = (config.description) ? config.description : ""; // default to "" if not specified
        this._status = config.status;
        this._frequency = (config.frequency) ? parseInt(config.frequency, 10) : "10";
        this._properties = new Map();

        // Copy each property
        if (config.properties) {
            for (const key in config.properties) {
                if (config.properties.hasOwnProperty(key)) {
                    this._properties.set(key, config.properties[key]);
                }
            }
        }
    }
    
    get id() {
        return this._id;
    }
    
    get url() {
        return this._url;
    }

    /**
     * Gets the component type, used to determine which plugin handler to delegate control of the component to
     * @returns {String} the module name
     */
    get type() {
        return this._type;
    }

    get name() {
        return this._name;
    }

    get description() {
        return this._description;
    }

    get status() {
        return this._status;
    }

    get frequency() {
        return this._frequency;
    }

    get properties() {
        return this._properties;
    }

    * [Symbol.iterator]() {
        for (const property of this._properties) {
            yield property;
        }
    }
}

class Component {

    constructor(config) {
        if (new.target === Component) {
            throw new TypeError("Component cannot be used directly, you must create a concrete implementation.");
        }

        if (!config instanceof ComponentConfig) {
            throw new TypeError("First argument must be an instance of ComponentConfig.");
        }

        this._config = config;
    }

    handleUpdate(data) {
        throw new TypeError("The handleUpdate(data) method must be overridden by the implementation.");
    }

    update(onlyOnce = false) {
        return this.status.done((data) => {
            this.handleUpdate(data);
        }).always(() => {
            if (!onlyOnce) {
                this.scheduleUpdate();
            }
        });
    }

    scheduleUpdate() {
        this._timer = setTimeout(this.update.bind(this), this.config.frequency * 1000);
    }

    stopUpdates() {
        if (this._timer) {
            clearTimeout(this._timer);
        }
    }

    render() {
        return $("<p>This component has not implemented a render function.</p>");
    }

    post(data) {
    }

    get status() {
        return $.getJSON(this.config.status);
    }

    get config() {
        return this._config;
    }
}


export {ComponentConfig, Component}