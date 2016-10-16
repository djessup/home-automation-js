# Home Automation Simulator
A browser-based, simulated home automation system.

## Requirements
TBC

## Building

This project uses NPM to manage project dependencies and JSPM/SystemJS for runtime dependencies. The first time you 
checkout the project you'lll need to install these dependencies. 

First, do a global installation of JSPM and the Gulp CLI wrapper (you only need to do this once, so if you've already 
installed these for another project you can skip this step): 

```
npm install -g gulp-cli jspm
```

Next, install all the project dependencies. This command will locally install project dependencies like Gulp, Karma, and
 BrowserSync, as well as runtime dependencies like jQuery, SystemJS, and Bootstrap:
```
npm install
```

Now that everything is installed you can start using the project. The quickest way to try out the app is via the 
built-in BrowserSync server:

```
gulp serve
```

## Acknowledgments

* hashCode.js adapted from [http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/](http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/)
* Light bulb CSS written from scratch, but inspired by [https://codepen.io/Simentesempre/pen/raoERY](https://codepen.io/Simentesempre/pen/raoERY)
* All dependencies are courtesy of their respective owners