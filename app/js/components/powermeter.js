"use strict";

import { Component } from "app/js/component";
import tmpl from "app/templates/power-meter.hbs!"

export class PowerMeter extends Component {

    constructor(container, config) {
        super(container, config);
    }

    handleUpdate(data) {
        if (data.volts !== undefined) {
            this.data.volts = data.volts;
        }
        if (data.amps !== undefined) {
            this.data.amps = data.amps;
        }
        if (data.watts !== undefined) {
            this.data.watts = data.watts;
        }
        if (data.powerFactor !== undefined) {
            this.data.powerFactor = data.powerFactor;
        }
    }

    render() {
        const percent = this.percent;

        let progressBarClass;
        if (percent > 75) {
            progressBarClass = "progress-bar-danger";
        } else if (percent > 50) {
            progressBarClass = "progress-bar-warning";
        } else if (percent > 25) {
            progressBarClass = "progress-bar-success";
        } else {
            progressBarClass = "progress-bar-info";
        }

        return $(tmpl({
            description: this.config.description,
            minWatts: this.minWatts,
            maxWatts: this.maxWatts,
            volts: this.volts,
            amps: this.amps,
            watts: this.watts,
            powerFactor: this.data.powerFactor,
            percent: this.percent,
            progressBarClass: progressBarClass
        }));
    }

    get volts() {
        return this.data.volts + " V"
    }

    get watts() {
        return Math.round(this.data.watts);
    }

    get amps() {
        if (this.data.amps < 1) {
            return this.data.amps * 1000 + " mA";
        }
        return this.data.amps + " A";
    }

    get minWatts() {
        if (this.config.properties.has("minWatts")) {
            return parseInt(this.config.properties.get("minWatts"), 10);
        }
        return 0;
    }

    get maxWatts() {
        if (this.config.properties.has("maxWatts")) {
            return parseInt(this.config.properties.get("maxWatts"), 10);
        }
        return 2500;
    }

    get percent() {
        return (100 / this.maxWatts * this.data.watts);
    }
}