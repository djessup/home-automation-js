// Karma configuration
// Generated on Thu Oct 13 2016 11:51:56 GMT+1100 (AUS Eastern Daylight Time)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: './app',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['systemjs', 'jasmine'],


        // list of files / patterns to load in the browser
        files: [
            'js/*.js'
        ],


        // list of files to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            // do not include libraries
            // '!(jspm_packages)**/*.js': ['coverage']
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],

        // coverageReporter: {
        //     instrumenters: { isparta : require('isparta') },
        //     instrumenter: {
        //         '**/*.js': 'isparta'
        //     }
        // },

        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],// 'PhantomJS'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        plugins: [
            'karma-systemjs',
            'karma-chrome-launcher',
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-coverage'
        ],

        systemjs: {
            // Path to your SystemJS configuration file
            configFile: 'config.js',

            // Patterns for files that you want Karma to make available, but not loaded until a module requests them. eg. Third-party libraries.
            serveFiles: [
                '**/*'
            ],

            // SystemJS configuration specifically for tests, added after your config file.
            // Good for adding test libraries and mock modules
            config: {
                baseUrl: '/app',
                paths: {
                    // "github:*": "app/jspm_packages/github/*",
                    // "npm:*": "app/jspm_packages/npm/*",
                    // "app/*": "app/*",
                    // "plugin-babel": "node_modules/systemjs-plugin-babel/plugin-babel.js",
                    // "systemjs-babel-build": "node_modules/systemjs-plugin-babel/systemjs-babel-browser.js",
                    "systemjs": "jspm_packages/system.js",
                    "system-polyfills": "jspm_packages/system-polyfills.js"
                    // "es6-module-loader": "node_modules/es6-module-loader/dist/es6-module-loader.js"
                }
            }
        }
    })
}
