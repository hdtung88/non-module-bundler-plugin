'use strict';

const promisify = require('util.promisify');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const fsReadFileAsync = promisify(fs.readFile);
const Terser = require("terser");

class NonModuleBundlerPlugin {

    constructor(options) {
        // Default options
        this.options = _.extend({
            filename: 'libs.js',
            sourceFiles: [],
            compress: false
        }, options);
    }

    apply(compiler) {
        let self = this,
            outputFileName = self.options.filename,
            sourceFiles = self.options.sourceFiles,
            needCompress = self.options.compress;

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

            let output = '',
                promises = [];

            for (let i = 0; i < sourceFiles.length; i++) {
                let fname = String(sourceFiles[i]);
                // console.log(fname + ' \n');
                promises.push(fsReadFileAsync(fname));
            }

            Promise.all(promises)
                .then(results => {
                    for (let k = 0; k < results.length; k++) {
                        output += String(results[k]) + '\n\n';
                    }

                    if (needCompress) {
                        let minified = this.compress(output);
                        if (minified.error) {
                            console.error('Unable to compress merged code: \n', minified.error);
                            return;
                        } else {
                            output = minified.code;
                        }
                    }

                    compilation.assets[outputFileName] = {
                        source: () => output,
                        size: () => output.length
                    };

                    callback();
                })
                .catch(function (reason) {
                    console.error(reason);
                });
        });
    }

    compress(code) {
        // I hope you understand Terser very well to change these
        // https://github.com/terser/terser
        return Terser.minify(code, {
            parse: {},
            compress: {},
            mangle: false,
            output: {},
            sourceMap: false,
            ecma: undefined, 
            keep_classnames: false,
            keep_fnames: false,
            ie8: true,
            module: false,
            nameCache: null, 
            safari10: true,
            toplevel: false,
            warnings: false,
        })
    }

}

module.exports = NonModuleBundlerPlugin;