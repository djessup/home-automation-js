"use strict";

import {Component} from "app/js/component";

export class Light extends Component {

    constructor(config) {
        super(config);
    }

    handleUpdate(data) {
        this.on = data.on;
        if (this.config.properties.get("dimmable")) {
            this.brightness = data.brightness;
        } else {
            this.brightness = 255;
        }

        this.logStatus();
    }

    logStatus() {
        console.info(`I am the ${this.config.name} light, I am currently turned ${(this.on) ? "on" : "off"} at ${(100 / 255 * this.brightness)}% brightness`)
    }

}