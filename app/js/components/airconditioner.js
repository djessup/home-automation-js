"use strict";

import { Component } from "app/js/component";
import tmpl from "app/tmpl/air-conditioner.hbs!"

/**
 * An air-conditioner component allowing monitoring and remote control of power, mode, target temperature, timer, and
 * fan oscillation.
 */
export class AirConditioner extends Component {

	/**
	 * Creates a new component instance.
	 * @param {jQuery|HTMLElement} container the container element the component will be rendered to
	 * @param {ComponentConfig} config the component's configuration
	 */
	constructor(container, config) {
		super(container, config);

		// Power toggle button event
		this.container.on("click", ".js-power-toggle", (event) => {
			this.togglePower();
			event.preventDefault();
		});

		// Oscillate toggle button event
		this.container.on("click", ".js-oscillate-toggle", (event) => {
			this.toggleOscillate();
			event.preventDefault();
		});

		// Timer menu
		this.container.on("click", ".js-timer-control", (event) => {
			const timer = $(event.target).data("aircon-timer");
			if (timer !== undefined) {
				this.timer(timer);
			}
			event.preventDefault();
		});

		// Mode menu
		this.container.on("click", ".js-mode-control", (event) => {
			const mode = $(event.target).data("aircon-mode");
			if (mode !== undefined) {
				this.mode(mode);
			}
			event.preventDefault();
		});

		// Temp up/down buttons
		this.container.on("click", ".js-temp-control", (event) => {
			const change = $(event.target).closest(".js-temp-control").data("temp-change");
			if (change !== undefined) {
				this.temp(this.targetTemp + parseInt(change, 10));
			}
			event.preventDefault();
		});
	}

	/**
	 * Set the air-conditioner mode
	 * @param mode string specifying the new mode (i.e. Auto/Cool/Heat/Dry/Fan)
	 */
	mode(mode) {
		this.data.mode = mode;
	}

	/**
	 * Turns the power on/off
	 * @param on the new power state, true = on, false = off
	 */
	power(on) {
		this.data.on = !!on;
	}

	/**
	 * Toggles the power state on and off
	 */
	togglePower() {
		this.power(!this.data.on);
	}

	/**
	 * Turns fan oscillation on/off
	 * @param on the new oscillation state, true = on, false = off
	 */
	oscillate(on) {
		this.data.oscillate = !!on;
	}

	/**
	 * Toggles fan oscillation on and off
	 */
	toggleOscillate() {
		this.oscillate(!this.data.oscillate);
	}

	/**
	 * Updates the timer duration
	 * @param {Integer} duration the new timer duration in seconds
	 */
	timer(duration) {
		this.data.timer = parseInt(duration, 10);

		// Simulate the timer counting down, in a real-life situation this data would probably come from the remote component
		clearInterval(this._decrementTimer);

		if (duration > 0) {
			this._decrementTimer = setInterval(() => {
				if (this.data.on) {
					this.data.timer--;
					// When it reaches zero turn off the power
					if (this.data.timer <= 0) {
						this.power(false);
						clearInterval(this._decrementTimer);
					}
				}
			}, 60000); // run once every minute
		}
	}

	/**
	 * Updates the target temperature.
	 * @param {Integer} temp the new target temperature
	 */
	temp(temp) {
		console.log(temp);
		this.data.targetTemp = parseInt(temp, 10);
	}

	/**
	 * Gets the target temperature
	 * @return {Integer}
	 */
	get targetTemp() {
		return this.data.targetTemp;
	}

	/**
	 * Parse and store new remote data.
	 * @param {Object} data the remote data object
	 */
	handleUpdate(data) {
		if (data.on !== undefined) {
			this.data.on = data.on;
		}
		if (data.targetTemp !== undefined) {
			this.data.targetTemp = data.targetTemp;
		}
		if (data.currentTemp !== undefined) {
			this.data.currentTemp = data.currentTemp;
		}
		if (data.mode !== undefined) {
			this.data.mode = data.mode;
		}
		if (data.timer !== undefined) {
			this.data.timer = data.timer;
		}
		if (data.oscillate !== undefined) {
			this.data.oscillate = data.oscillate;
		}
	}

	/**
	 * Renders the component using it's Handlebars template
	 * @return {String} Returns an HTML string containing the rendered component
	 */
	render() {
		return tmpl({
			"description": this.config.description,
			"on": this.data.on,
			"targetTemp": this.targetTemp,
			"currentTemp": this.data.currentTemp,
			"mode": this.data.mode,
			"timer": this.data.timer,
			"oscillate": this.data.oscillate
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
			// There is a 10% chance the temp will change by +/- 1C
			const variation              = (0.2 > Math.random() >= 0.1) ? 1 : (0.3 > Math.random() >= 0.2) ? -1 : 0;
			this._remoteData.currentTemp = this._remoteData.currentTemp + variation;
		}
	}

}