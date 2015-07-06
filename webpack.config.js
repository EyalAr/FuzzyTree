var webpack = require("webpack");

module.exports = {
    entry: "./src/FuzzyTree.js",
    module: {
        loaders: [{
            test: /src\/.+\.js$/,
            loader: 'babel'
        }]
    },
    output: {
        filename: "dist/FuzzyTree.js",
        library: "FuzzyTree",
        libraryTarget: "umd"
    },
    externals: [{
        lodash: {
          root: '_',
          commonjs2: 'lodash',
          commonjs: 'lodash',
          amd: 'lodash'
        }
    }],
    plugins: [
        new webpack.SourceMapDevToolPlugin(
            '[file].map', null, "../[resource-path]", "../[resource-path]")
    ]
}
