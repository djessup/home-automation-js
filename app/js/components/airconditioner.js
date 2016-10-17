"use strict";

import { Component } from "app/js/component";
import tmpl from "app/templates/air-conditioner.hbs!"

export class AirConditioner extends Component {

	constructor(container, config) {
		super(container, config);

		$(this.container).on("click", ".js-power-toggle", (event) => {
			this.togglePower();
			event.preventDefault();
		});
		$(this.container).on("click", ".js-oscillate-toggle", (event) => {
			this.toggleOscillate();
			event.preventDefault();
		});
		$(this.container).on("click", ".js-timer-control", (event) => {
			const timer = $(event.target).data("aircon-timer");
			if (timer !== undefined) {
				this.timer(timer);
			}
			event.preventDefault();
		});
		$(this.container).on("click", ".js-mode-control", (event) => {
			const mode = $(event.target).data("aircon-mode");
			if (mode !== undefined) {
				this.mode(mode);
			}
			event.preventDefault();
		});
	}

	mode(mode) {
		this.data.mode = mode;
	}

	power(on) {
		this.data.on = !!on;
	}

	togglePower() {
		this.power(!this.data.on);
	}

	oscillate(on) {
		this.data.oscillate = !!on;
	}

	toggleOscillate() {
		this.oscillate(!this.data.oscillate);
	}

	timer(duration) {
		this.data.timer = parseInt(duration, 10);

		// Simulate the timer counting down
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
			}, 60000);
		}
	}

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

	render() {
		return $(tmpl({
			"description": this.config.description,
			"on": this.data.on,
			"targetTemp": this.data.targetTemp,
			"currentTemp": this.data.currentTemp,
			"mode": this.data.mode,
			"timer": this.data.timer,
			"oscillate": this.data.oscillate
		}));
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