# Home Automation Simulator

A simulated, browser-based home automation control panel, written in ES6.

## Requirements

* [Node/NPM](https://nodejs.org/)

## Overview

This project simulates a home automation system comprised of an "internet of things" collection of physical components 
and sensors, which are controlled via a browser-based UI. The interface is built using jQuery and Bootstrap, and the 
controlling framework is written in future-facing ES6 and uses SystemJS for managing dependencies and transpilation to
ES5. It is able to run entirely in-browser.
  
Since this is a simulator, it does not use actual physical components (although in principle if a compatible component 
existed it should work with this project) and instead emulates the existence of components using locally-hosted data.
Although data is not actually persisted, the framework does emulate persisting component data until the browser is 
refreshed.

The project provides an easy to use framework for deploying components that minimises the amount of boilerplate code 
needed to build a component, allowing effort to be focused the component itself. More information on how to create
components is provided below.


## Setup

This project uses NPM to manage project dependencies and JSPM/SystemJS for runtime dependencies, as well as Gulp as a
build system. This means you'll need to globally install the CLI tools for Gulp and JSPM if you don't already have them.

First, make sure you've installed [Node.js and NPM](https://nodejs.org/) for your platform, then run:

```bash
npm install -g gulp-cli jspm
```

Now you can install the project and runtime dependencies:
 
```bash
npm install
```

You should now have all the NPM and JSPM dependencies installed to `./node_modules` and `./app/jspm_packages` 
respectively. You shouldn't need to do this again (unless you're changing the project dependencies yourself, or the
project is updated).

## Usage

The quickest way to try out the app is via the built-in server:

```bash
gulp serve
```

This will start a local server at [http://localhost:3000/](http://localhost:3000/) running the app with several sample
components registered.

## Extending

The application consists of a main controller (`App`) which is responsible for loading components and initialising them, 
and the components themselves.

### The application controller

The `App` serves as a registry, and provides three public functions:

```javascript
class App {
    /**
     * Registers a new component using it's configuration URL.
     * @param {String} url The component's configuration URL
     * @returns {Promise} Returns a promise that is resolved once the component has been loaded. The component 
     *                    instance is supplied as the only argument.
     */
    register(url);
    
    /**
     * Removes a previously registered component.
     * @param {String} id The ID of the component to remove.
     */
    remove(id);
    
    /**
     * Gets the ID of the component using it's configuration URL. The component does *not* have to be registered 
     * beforehand.
     * @param {String} url The configuration URL of a component
     * @return {String} Returns the ID for the component identified by the URL provided.
     */
    static id(url);
}
```

Using `App` is simple, all it needs is a container element to place component panels in. It'll accept anything that can
be resolved by jQuery's `$` (including selectors, DOM elements, and other jQuery elements):

```javascript
var app = new App("#container");
```

Then you can register components:

```javascript
app.register("/data/my-component/config.json");
```

If you need to get hold of the component instance:

```javascript
app.register("/data/my-component/config.json").then(function(component) {
    // do something
});
```

### Components

Components are classes and must extend the base `Component` class in `app/js/component.js`. 

The base component provides most of the "magic" that makes up the framework, including automatic updating of remote 
component data, and automatically syncing data back to the component after it is modified (e.g. by the user interacting 
with the UI).
 
Components must implement a minimal set of functionality:

```javascript
class Component {
    /**
     * Processes new data from the received from component's data endpoint.
     * @param {Object} data An object containing the data from the remote endpoint
     */
    handleUpdate(data);
    
    /**
     * Renders the components view. Can return anything jQuery's DOM functions are able to understand. 
     * @return {String|jQuery|HTMLElement} Returns the rendered view.
     */
    render();
}
```

The `handleUpdate()` function will be called once each time the remote data endpoint is polled and will be provided
with an object containing whatever data the endpoint provided. A typical example could be:

```javascript
{
    "poweredOn": true,
    "temperature": 23
}
```

It's up to you what you do with this data, but usually you'll want to merge it with your component's local data in
`this.data`.

The `render()` function will be called automatically whenever `this.data` is updated, and it's return value will be 
injected into the component's container. You should not normally have to call any render functions or do any DOM 
manipulation yourself, since the `Component` base class will take care of it for you. Just update your component state
in `this.data`, then use that data in your `render()` function to generate the component's view.

Let's create a demo component in `app/js/components/mycomponent.js` to see this in action:

```javascript
"use strict";

import {Component} from "app/js/component";

export class MyComponent extends Component {
    constructor(container, config) {
        super(container, config);
    }

    // Store the updated component state
    handleUpdate(data) {
        this.data.poweredOn = data.poweredOn;
        this.data.temperature = data.temperature;
    }

    // Render the component view
    render() {
        return "<div><p>Power: " + (this.data.poweredOn ? "On" : "Off")
            + "</p><p>Temperature: " + this.data.temperature + "C</p></div>";
    }
}
```

That's all that's needed for a basic read-only component. The remote data will be polled according to the component's 
configuration and given to `handleUpdate()` to store. When `this.data` changes the `render()` function is automatically 
called and the result injected into the DOM. 

#### Mocking endpoints

Now we have a basic component, we need to register it with `App` so it appears in the dashboard. To do this we'll 
create a pair of mock remote endpoints in `app/data/my-component/`:

**config.json**
```javascript
{
  "type": "MyComponent",
  "name": "Demo component",
  "description": "A simple read-only demo component",
  "status": "/data/my-component/status.json",
  "frequency": "10",
  "properties": { }
}
```

The `type` property is important and must exactly match your component's class name. The `name` and `description` 
properties are descriptors for display purposes only. The `status` property must point to the data endpoint, and 
`frequency` indicates how often (in seconds) to poll it for new data. The `properties` object can be used to define
component-specific configuration values, but we can ignore that here.

**status.json**
```javascript
{
    "poweredOn": true,
    "temperature": 23
}
```

We'll use the same status data as the earlier example. This data will loaded the first time the data endpoint is polled
(subsequent polls will not actually load this data again because it would interfere with the persistence emulation the
simulator does, but in a real application it would be polled for each update).

Now that we have our endpoints configured, we can register the component. Try it out by running `gulp serve` to start
the app, and register your component in the UI by entering `/data/my-component/config.json`. You should see your new 
component appear in the dashboard (if not open the console to see what went wrong!).

#### Getting user feedback via events

We can extend our component to respond to user input with a simple modification:

```javascript
export class MyComponent extends Component {
    ...
    render() {
        // use jQuery to render the view this time
        const view = $("<div><p>Power: " + (this.data.poweredOn ? "On" : "Off") + "</p><p>Temperature: " + this.data.temperature + "C</p> <button>Hotter!</button></div>");
        
        // when the button is clicked, increment the temperature
        view.find('button').click((event) => {
            this.data.temperature++;
            event.preventDefault();
        });
        
        return view;
    }
    ...
}
```

Now bring up your component in a browser again and click the "Hotter!" button. You should see the temperature increase
each time.

#### Using template engines

There are numerous Javascript template engines (Handlebars, Mustache, Dash, Jade, etc) which are very useful for 
rendering component views since they keep code clean and concerns separate.

The simulator ships with Handlebars (though you can install your own with JSPM if you want) and it's very easy to use 
with SystemJS. We can refactor our demo component by creating a view template at  `app/tmpl/my-component.hbs`:

```html
<p>Power: {{#if poweredOn}}On{{else}}Off{{/if}}</p>
<p>Temperature: {{temperature}}C</p>
<button>Hotter!</button>
```

And in our component:

```javascript
...
import tmpl from "app/tmpl/my-component.hbs!";

export class MyComponent extends Component {
    ...
    render() {
        return tmpl({
            poweredOn: this.data.poweredOn,
            temperature: this.data.temperature
        })
    }
    ...
}
````

There is, however, a significant "gotcha" when using such engines. In order to attach event listeners the element needs 
to already exist *somewhere* in the DOM, but most template engines do not append content to the DOM, so if you try
to attach events from `render()` like we did earlier they will not work.

There are two options to workaround this limitation. 

The first, and usually preferred option, is to use [delegated events](http://api.jquery.com/on/#direct-and-delegated-events) 
to attach listeners. Delegated event listeners can be attached to the component container (which is already in the DOM) 
instead of the individual element being targeted at any stage in the component lifecycle. The recommended time to attach
them is during construction: 

```javascript
export class MyComponent extends Component {
    constructor(container, config) {
        super(container, config);

        // attach event listener
        this.container.on("click", "button", (event) => {
            this.data.temperature++;
            event.preventDefault();
        });
    }
    ...
}
```

It is not recommended to attach delegated events from within `render()`, since this will result in duplicate events 
being registered each time the component is re-rendered.

The second option is to  use the `afterRender()` hook to attach listeners *after* the component has been rendered (and
injected into the DOM):

```javascript
class MyComponent extends Component {
    afterRender() {
        // attach event listener
        this.container.find("button").click((event) => {
            this.data.temperature++;
            event.preventDefault();
        });
    }
}
```

Both approaches will produce the same results, however delegated events may perform slightly better.  

#### Persisting data

In addition to automatically rendering your component, data is automatically POSTed back to the remote data endpoint
whenever `this.data` is changed. The POST data will be `this.data`, and the remote endpoint should merge the updates
as needed (because this is a client-side only simulation this behaviour is emulated, but you can see the emulated POST 
requests in the browser console).

POSTs are automatically throttled to avoid overloading remote endpoints if a large number of properties are updated in a 
short period, and no special action is needed by components to do this.

In the event you need to pause or disable automatic POSTing you can call `this.disablePost()` and then 
`this.enablePost()` to enable it again.

#### Pausing and forcing data updates

You can pause automatic data updates with `this.stopUpdates()` and enable them again using `this.update()`, which will
immediately perform an update, then schedule automatic updates (if you want to do a single update without re-enabling 
automatic updates, use `this.update(false))`.

#### Accessing configuration

The values from the component's configuration endpoint are available via `this.config`, for example: 
`this.config.description`. See the `ComponentConfig` in `app/js/component.js` for more information. 

## Closing thoughts

This is a local simulator, so the consequences of weak security or buggy behaviour are not serious. In a real-life 
system however these could have very serious consequences. A few things that would need to happen to take this project 
from it's current state to a real-world system include the following. This list is non-exhaustive.

* Strong authentication for the UI to prevent unauthorised visitors from controlling components.
* Secure communication between components and the UI, including transport encoding (i.e. HTTPS) and token-based 
authentication.
* Stricter checking of data by components to ensure only valid values are accepted.

There is also a lot of scope for UI/UX improvements in the interface, the current implementation is intentionally basic.

## Known issues

1. The fluid grid (Bricklayer) used to arrange component tiles occasionally has hiccups where components are arranged in
   strange orders, or they are displayed in a single column even at desktop screen sizes. These usually only happen when 
   resizing the viewport, and can be fixed by resizing the window from large, to small, and back to large again. 
   There are probably better fluid grid solutions out there. 

## Todo

* Improve the fluid grid behaviour
* Use Local Storage for emulating persistence between browser refreshes
* Add a [WiFi kettle](https://www.theguardian.com/technology/2016/oct/12/english-man-spends-11-hours-trying-to-make-cup-of-tea-with-wi-fi-kettle) component

## Acknowledgments

* hashCode.js adapted from [http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/](http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/)
* Light bulb CSS written from scratch, but inspired by [https://codepen.io/Simentesempre/pen/raoERY](https://codepen.io/Simentesempre/pen/raoERY)
* All dependencies are courtesy of their respective owners