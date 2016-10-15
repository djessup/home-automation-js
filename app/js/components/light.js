"use strict";

import {Component} from "app/js/component";
import tmpl from "app/templates/light.hbs!"
import "app/css/light.css!";

export class Light extends Component {

    constructor(config) {
        super(config);
    }

    handleUpdate(data) {
        this.on = data.on;
        if (this.config.properties.get("dimmable")) {
            this.dimmable = true;
            this.brightness = data.brightness;
        } else {
            this.dimmable = false;
            this.brightness = 255;
        }
    }


    toggle() {
        this.on = !this.on;
    }

    render() {

        const html = $(tmpl({
            on: this.on,
            dimmable: this.dimmable
        }));

        html.find(".js-power-button").click(() => {
            this.toggle();
        });

        return html;
        // const btn = $("<button class='btn btn-primary'>Alerter</button>");
        // btn.click(()=> {
        //     alert("test");
        // });
        //
        // return btn;
    }

}