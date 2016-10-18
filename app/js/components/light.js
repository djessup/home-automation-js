"use strict";

import { Component } from "app/js/component";
import tmpl from "app/tmpl/light.hbs!";
import "app/css/light.css!";

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
     * @return {jQuery}
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

    power(on) {
        this.data.on = !!on;
    }

    dimmer(amount) {
        this.data.brightness = Math.min(Math.max(amount, 0), 100);
    }

    toggle() {
        this.power(!this.on);
    }

    get on() {
        return !!this.data.on;
    }

    get brightness() {

        if (!this.on) {
            return 0;
        }

        if (this.dimmable && this.data.brightness !== undefined) {
            return this.data.brightness;
        }

        return 100;
    }

    get dimmable() {
        return this.config.properties.has("dimmable") ? this.config.properties.get("dimmable") : false;
    }

}