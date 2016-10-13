"use strict";

import {Component} from "app/js/component";

export class Light extends Component {

    constructor(config) {
        super(config);
        console.log(config.properties)
    }

}