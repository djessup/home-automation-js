"use strict";

import { Component } from "app/js/component";
import bootstrap from "bootstrap/js/bootstrap.js";
import tmpl from "app/templates/light.hbs!";
import "app/css/light.css!";

export class Light extends Component {

    /**
     *
     * @param {ComponentConfig} config
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


    render() {
        return $(tmpl({
            name: this.config.name,
            description: this.config.description,
            dimmable: this.dimmable,
            brightness: this.brightness,
            on: this.on
        }));
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