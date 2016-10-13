"use strict";

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

        this._type = config.type;
        this._name = config.name;
        this._description = (config.description) ? config.description : ""; // default to "" if not specified
        this._properties = new Map();

        // Copy each property
        if (config.properties) {
            for (const key in config.properties) {
                if (config.hasOwnProperty(key)) {
                    this._properties.set(key, config.properties[key]);
                }
            }
        }
    }

    get type() {
        return this._type;
    }

    get name() {
        return this._name;
    }

    get description() {
        return this._description;
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

    constructor(container) {
        if (new.target === Component) {
            throw new TypeError("Component cannot be used directly, you must create a concrete implementation.");
        }
    }

    render() {

    }

    post(data) {

    }
}


export {ComponentConfig, Component}