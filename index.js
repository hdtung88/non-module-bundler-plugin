'use strict';

const promisify = require('util.promisify');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const fsReadFileAsync = promisify(fs.readFile);
const UglifyJS = require("uglify-js");

class NonModuleBundlerPlugin {

    constructor(options) {
        // Default options
        this.options = _.extend({
            filename: 'libs.js',
            sourceFiles: []
        }, options);
    }

    apply(compiler) {
        let self = this,
            outputFileName = self.options.filename,
            sourceFiles = self.options.sourceFiles;

        // emit is asynchronous hook, tapping into it using tapAsync, you can use tapPromise/tap(synchronous) as well
        compiler.hooks.emit.tapAsync('NonModuleBundlerPlugin', (compilation, callback) => {

            if (!(sourceFiles instanceof Array)) {
                console.error('Failed to read source files: must be an array of file path.');
                return;
            }

            if (sourceFiles.length <= 0) {
                callback();
                return;
            }

            let outputContent = '',
                promises = [];

            for (let i = 0; i < sourceFiles.length; i++) {
                let fname = String(sourceFiles[i]);
                // console.log(fname + ' \n');
                promises.push(fsReadFileAsync(fname));
            }

            Promise.all(promises)
                .then(results => {
                    for (let k = 0; k < results.length; k++) {
                        outputContent += String(results[k]) + '\n\n';
                    }

                    UglifyJS.minify(outputContent);

                    compilation.assets[outputFileName] = {
                        source: () => outputContent,
                        size: () => outputContent.length
                    };

                    callback();
                })
                .catch(function(reason) {
                    console.error(reason);
                });
        });
    }

}

module.exports = NonModuleBundlerPlugin;