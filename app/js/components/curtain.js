"use strict";

import {Component} from "app/js/component";
import tmpl from "app/tmpl/curtain.hbs!";

export class Curtain extends Component {

    /**
     * Creates a new component instance.
     * @param {jQuery|HTMLElement} container the container element the component will be rendered to
     * @param {ComponentConfig} config the component's configuration
     */
    constructor(container, config) {
        super(container, config);

        this.container.on("click", ".js-open-toggle", (event) => {
            this.toggle();
            event.preventDefault();
        });
    }

    /**
     * Opens/closes the curtain
     * @param {Boolean} open the new open state, true = open, false = close
     */
    open(open) {
        this.data.open = !!open;
    }

    /**
     * Toggles the curtain open and closed
     */
    toggle() {
        this.open(!this.isOpen);
    }

    /**
     * Gets the current open state
     * @return {Boolean} returns true if the curtain is open, false if it's closed
     */
    get isOpen() {
        return !!this.data.open;
    }

    /**
     * Parse and store new remote data.
     * @param {Object} data the remote data object
     */
    handleUpdate(data) {
        if (data.open !== undefined) {
            this.data.open = data.open;
        }
    }

    /**
     * Renders the component using it's Handlebars template
     * @return {String} Returns an HTML string containing the rendered component
     */
    render() {
        return $(tmpl({
            description: this.config.description,
            isOpen: this.isOpen
        }));
    }
}