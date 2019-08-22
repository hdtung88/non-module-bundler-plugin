# non-module-bundler-plugin

<h1>Non Module Bundler Plugin</h1>
<p>This plugin will simply merge all your input js files into a single one. Sorry, no obfuscate or minify, etc .. supported yet</p>
<h2 align="center">Install</h2>
```bash
  npm i --save-dev non-module-bundler-plugin
```


<h2 align="center">Usage</h2>

Just add the plugin to your `webpack` config as follows:

**webpack.config.js**
```js
const path = require('path');
const NonModuleBundlerPlugin = require('non-module-bundler-plugin')

module.exports = {
  entry: 'index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'index.js'
  },
  plugins: [
    new NonModuleBundlerPlugin({
            filename: 'libs.js',      // This is your output bundle name
            sourceFiles: [
                path.resolve(__dirname, './src/lib/script1.js'),       // paths to script files
                path.resolve(__dirname, './src/lib/script2.js'),
                path.resolve(__dirname, './src/script3.js'),
                path.resolve(__dirname, './src/lib/america_lib/script4.js'),
                path.resolve(__dirname, './src/lib/china_lib/script5.js')
            ]
        })
  ]
}
```

This will generate a file named `libs.js` in your build folder `dist` containing merged code of all your script files above


<br>
<br>

