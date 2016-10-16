"use strict";

import $ from "jquery";

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

    /**
     * Gets the component ID.
     * @returns {String}
     */
    get id() {
        return this._id;
    }

    /**
     * Gets the components configuration URL.
     * @returns {String}
     */
    get url() {
        return this._url;
    }

    /**
     * Gets the component type, used to determine which plugin handler to delegate control of the component to.
     * @returns {String} the module name
     */
    get type() {
        return this._type;
    }

    /**
     * Gets the component name
     * @returns {String} the component name
     */
    get name() {
        return this._name;
    }

    /**
     * Gets the component description
     * @returns {String} the component description
     */
    get description() {
        return this._description;
    }

    /**
     * Gets the status endpoint URL
     * @returns {String} the URL of the component's status endpoint
     */
    get status() {
        return this._status;
    }

    /**
     * Gets the update frequency (in seconds)
     * @returns {Integer} the update frequency, in seconds
     */
    get frequency() {
        return this._frequency;
    }

    /**
     * Gets a map of any component-specific configuration properties.
     * @returns {Map} a map of any component-specific configuration properties. If there are no non-standard properties
     * an empty map will be returned
     */
    get properties() {
        return this._properties;
    }
}

class Component {

    constructor(container, config) {
        if (new.target === Component) {
            throw new TypeError("Component cannot be used directly, you must create a concrete implementation.");
        }

        if (container === undefined) {
            throw new TypeError("A container must be provided");
        }

        if (!config instanceof ComponentConfig) {
            throw new TypeError("Configuration must be an instance of ComponentConfig.");
        }

        this._container = container;
        this._config = config;
        this._data = {};

        // The data proxy will monitor changes made to the component's data and automatically post updates back to the
        // component
        this._dataProxy = new Proxy(this._data, {
            set: (target, property, value) => {
                if (this._data[property] !== value) {
                    this._data[property] = value;
                    if (this._postEnabled) {
                        this._postStatus();
                    }
                    this._render();
                }
                return true;
            }
        });

        this.enablePost();
    }

    _postStatus() {
        // Debounce the post in case multiple properties are updated in quick succession.
        if (this._postTimer !== undefined) {
            clearTimeout(this._postTimer);
        }

        this._postTimer = setTimeout(() => {
            this._doPost();
        }, 200);
    }

    /**
     * POSTs status updates back to the component's status endpoint. Since this is a simulaton the values are retained
     * in memory, in a real-life situation this function would do something like:
     * <code>$.post(this.config.status, this.data)</code>
     * @returns {Promise}
     * @private
     */
    _doPost() {
        console.info(`POSTing status of ${this.config.type} (${this.config.name}):`, this.data);

        // Temporarily disable updates to avoid race conditions where the remote state could be queried in between a
        // local change being made, and it getting POST'd to the remote endpoint.
        const wasDoingUpdates = this._updateEnabled;
        this.stopUpdates();

        return new Promise((resolve, reject) => {
            this._remoteData = Object.assign(this._remoteData, this.data);
            resolve();
        }).then(() => {
            // Re-enable updates
            if (wasDoingUpdates) {
                this._scheduleUpdate();
            }
        });
    }

    _scheduleUpdate() {
        this.stopUpdates();
        this._updateEnabled = true;
        this._timer = setTimeout(this.update.bind(this), this.config.frequency * 1000);
    }

    _render() {
        this.container.html(this.render());
        this.afterRender();
    }

    disablePost() {
        this._postEnabled = false;
    }

    enablePost() {
        this._postEnabled = true;
    }

    update(onlyOnce = false) {
        return this.status.then((data) => { // resolve handler
            this.disablePost();
            this.handleUpdate(data);
            this.enablePost();
            if (!onlyOnce) {
                this._scheduleUpdate();
            }
        }, () => { // reject handler
            if (!onlyOnce) {
                this._scheduleUpdate();
            }
        });
    }

    /**
     * Stops remote updates
     */
    stopUpdates() {
        this._updateEnabled = false;
        if (this._timer) {
            clearTimeout(this._timer);
        }
    }

    handleUpdate(data) {
        throw new TypeError("The handleUpdate(data) method must be overridden by the implementation.");
    }

    /**
     * Gets the view that will be rendered for the component. This function should return a jQuery element, HTMLElement,
     * or HTML string.
     * @returns {jQuery|HTMLElement|String} the component's view content
     */
    render() {
        return $("<p>This component has not implemented a render function.</p>");
    }

    /**
     * Hook function that will be called after the component view has been rendered. Can be used by implementations
     * which need to run actions after the component view has been inserted into the DOM.
     */
    afterRender() {
    }

    /**
     * Gets the components data object, which contains all it's mutable state properties. Changes to this object are
     * automatically persisted back component.
     * @returns {Proxy}
     */
    get data() {
        return this._dataProxy;
    }

    /**
     * Returns a Promise to resolve the latest status from the component's status endpoint. Since this is a simulation
     * the remote status is only requested once, because state changes are not persisted and exist only in memory.
     * Subsequent status updates will return the in-memory status state. In a real-life situation this function would
     * repeatedly query the remote endpoint.
     * @returns {Promise} a promise which will be resolved when the latest data is retrieved from the component's
     *     remote endpoint.
     */
    get status() {
        return new Promise((resolve, reject) => {
            if (this._remoteData === undefined) {
                $.getJSON(this.config.status).done((data) => {
                    this._remoteData = data;
                    resolve(this._remoteData);
                }).fail((xhr, status, error) => {
                    reject(xhr, status, error);
                });
            } else {
                resolve(this._remoteData);
            }
        });
    }

    /**
     * Gets the component's configuration object.
     * @returns {ComponentConfig} the component configuration object
     */
    get config() {
        return this._config;
    }

    /**
     * Gets the component's container element, wrapped in a jQuery container.
     * @returns {jQuery|HTMLElement} the component container
     */
    get container() {
        return $(this._container);
    }
}


export { ComponentConfig, Component }