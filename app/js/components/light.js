"use strict";

import { Component } from "app/js/component";
import tmpl from "app/tmpl/light.hbs!";
import "app/css/light.css!";

/**
 * A light component with dimmer support.
 */
export class Light extends Component {

    /**
     * Creates a new component instance.
     * @param {jQuery|HTMLElement} container the container element the component will be rendered to
     * @param {ComponentConfig} config the component's configuration
     */
    constructor(container, config) {
        super(container, config);

        this.container.on("click", ".js-power-button,.b-light__bulb", (event) => {
            this.toggle();
            event.preventDefault();
        });

        this.container.on("click", ".js-brightness-control", (event) => {
            const brightness = $(event.target).data("light-brightness");
            this.power(true);
            if (brightness !== undefined) {
                this.dimmer(parseInt(brightness, 10));
            }
            event.preventDefault();
        });
    }

    /**
     * Parse and store new remote data.
     * @param {Object} data the remote data object
     */
    handleUpdate(data) {
        if (data.on !== undefined) {
            this.power(data.on);
        }

        if (this.dimmable) {
            if (data.brightness !== undefined) {
                this.dimmer(data.brightness);
            } else {
                this.data.brightness = (this.on) ? 100 : 0;
            }
        }
    }

    /**
     * Renders the component using it's Handlebars template
     * @return {String} Returns an HTML string containing the rendered component
     */
    render() {
        return tmpl({
            name: this.config.name,
            description: this.config.description,
            dimmable: this.dimmable,
            brightness: this.brightness,
            on: this.on
        });
    }

    /**
     * Turns the light on and off
     * @param {Boolean} on the updated power state, true = on, false = off
     */
    power(on) {
        this.data.on = !!on;
    }

    /**
     * Sets the light's brightness to the specified percentage (where 0 is the darkest and 100 is full brightness.
     * @param {Number} amount the new brightness setting. Values outside the range of 0-100 will be capped to the nearest
     *     allowed value.
     */
    dimmer(amount) {
        this.data.brightness = Math.min(Math.max(amount, 0), 100);
    }

    /**
     * Toggles the power setting on/off.
     */
    toggle() {
        this.power(!this.on);
    }

    /**
     * Gets the power status
     * @return {Boolean} the current power status, true = on, false = off
     */
    get on() {
        return !!this.data.on;
    }

    /**
     * Gets the current brightness. If the light is off, this will always report zero. If the light is on but not
     * dimmable it will always report 100.
     * @return {Number} the current brightness.
     */
    get brightness() {

        if (!this.on) {
            return 0;
        }

        if (this.dimmable && this.data.brightness !== undefined) {
            return this.data.brightness;
        }

        return 100;
    }

    /**
     * Indicates if the light is dimmable or not.
     * @return {Boolean} Returns true if the light is dimmable, false if it is not (or has not been configured).
     */
    get dimmable() {
        return this.config.properties.has("dimmable") ? !!this.config.properties.get("dimmable") : false;
    }

}