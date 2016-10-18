"use strict";

import { Component } from "app/js/component";
import tmpl from "app/tmpl/power-meter.hbs!";

/**
 * A read-only power meter component with simulated data fluctuations.
 */
export class PowerMeter extends Component {

    /**
     * Creates a new component instance.
     * @param {jQuery|HTMLElement} container the container element the component will be rendered to
     * @param {ComponentConfig} config the component's configuration
     */
    constructor(container, config) {
        super(container, config);
    }

    /**
     * Parse and store new remote data.
     * @param {Object} data the remote data object
     */
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

    /**
     * Renders the component using it's Handlebars template
     * @return {String} Returns an HTML string containing the rendered component
     */
    render() {
        const percent = this.percent;

        // Set the progress bar colour based on the wattage percent
        // 0-25 = blue, 26-50 = green, 51-75 = yellow, 76-100 = red
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

        return tmpl({
            description: this.config.description,
            minWatts: this.minWatts,
            maxWatts: this.maxWatts,
            volts: this.volts,
            amps: this.amps,
            watts: this.watts,
            powerFactor: this.powerFactor,
            percent: this.percent,
            progressBarClass: progressBarClass
        });
    }

    /**
     * Because this is a simulated system we'll cheat and fake some variations in the "remote" data to simulate real
     * activity and make the component seem dynamic. Basically this function will fiddle with the local cache of remote
     * data as if it was provided by a real remote service.
     */
    update(onlyOnce = false) {
        super.update(onlyOnce);

        if (this._remoteData !== undefined) {
            // Fudge the numbers by +/- 5%
            const variation = 1 + (Math.random() * (0.05 + 0.05) - 0.05); // randomly vary by between -5% and 5%
            this._remoteData.volts = Math.min(this._remoteData.volts * variation, 250); // cap at 250V
            this._remoteData.amps = this._remoteData.amps * variation;
            this._remoteData.powerFactor = Math.min(this._remoteData.powerFactor * variation, 1); // cap at 1
            this._remoteData.watts = this._remoteData.volts * this._remoteData.amps;
        }
    }

    /**
     * Gets the current volts, formatted for display e.g. 240 V
     * @return {String} the current volts, formatted
     */
    get volts() {
        return Math.round(this.data.volts) + " V";
    }

    /**
     * Gets the current watts
     * @return {Integer} the current watts
     */
    get watts() {
        return Math.round(this.data.watts);
    }

    /**
     * Gets the current amps, formatted for display. If less than one the value returned will be in
     * milliamps e.g. "450 mA", if greater than or equal to one it will be returned as amps, rounded to two
     * decimal places e.g. "1.23 A"
     * @return {String} the current amps, formatted as a human-readable string
     */
    get amps() {
        if (this.data.amps < 1) {
            return Math.round(this.data.amps * 1000) + " mA";
        }
        return Math.round(this.data.amps * 100) / 100 + " A";
    }

    /**
     * Gets the current power factor, rounder to two decimal places
     * @return {Number} the rounded power factor
     */
    get powerFactor() {
        return Math.round(this.data.powerFactor * 100) / 100;
    }

    /**
     * Gets the minimum number of watts specified by the component configuration, or zero if not configured.
     * @return {Integer} the minimum watts
     */
    get minWatts() {
        if (this.config.properties.has("minWatts")) {
            return parseInt(this.config.properties.get("minWatts"), 10);
        }
        return 0;
    }

    /**
     * Gets the maximum number of watts specified by the component configuration, or 2500 if not configured.
     * However, if the current watts is greater than this number then the current watts will be returned.
     * @return {Integer} the maximum watts
     */
    get maxWatts() {
        let maxWatts = 2500; // default
        if (this.config.properties.has("maxWatts")) {
            maxWatts = parseInt(this.config.properties.get("maxWatts"), 10);
        }

        return Math.max(maxWatts, this.watts);
    }

    /**
     * Gets the current watts expressed as a percentage of the maximum watts.
     * @return {number}
     */
    get percent() {
        return (100 / this.maxWatts * this.data.watts);
    }
}