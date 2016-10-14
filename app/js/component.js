"use strict";

import $ from "jquery";

class ComponentConfig {
    constructor(config) {

        // Check "type" property is present
        if (!config.type || config.type === "") {
            throw new TypeError("Component description is missing the \"type\" property.");
        }

        // Check "name" property is present
        if (!config.name || config.name === "") {
            throw new TypeError("Component description is missing the \"name\" property.");
        }

        // Check "status" property is present
        if (!config.status || config.status === "") {
            throw new TypeError("Component description is missing the \"status\" property.");
        }

        this._type = config.type;
        this._name = config.name;
        this._description = (config.description) ? config.description : ""; // default to "" if not specified
        this._status = config.status;
        this._frequency = (config.frequency) ? parseInt(config.frequency, 10) : "10";
        this._properties = new Map();

        // Copy each property
        if (config.properties) {
            for (const key in config.properties) {
                if (config.hasOwnProperty(key)) {
                    console.log(key);
                    this._properties.set(key, config.properties[key]);
                }
            }
        }
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

class ComponentInstance {
    constructor(instance, config, url) {
        this._instance = instance;
        this._config = config;
        this._url = url;
    }

    update() {
        this.instance.update().always(() => {
            this.scheduleUpdate();
        });
    }

    scheduleUpdate() {
        this._timer = setTimeout(this.update.bind(this), this.config.frequency * 1000);
    }

    stopUpdate() {
        if (this._timer) {
            clearTimeout(this._timer);
        }
    }

    get instance() {
        return this._instance;
    }

    get config() {
        return this._config;
    }

    get url() {
        return this._url;
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

        this.config = config;
    }

    update() {
        return this.status.done((data) => {
            this.handleUpdate(data);
        });
    }

    handleUpdate(data) {
        throw new TypeError("The handleUpdate(data) method must be overridden by the implementation.");
    }

    render() {
    }

    post(data) {
    }

    get status() {
        return $.getJSON(this.config.status);
    }
}


export {ComponentConfig, ComponentInstance, Component}