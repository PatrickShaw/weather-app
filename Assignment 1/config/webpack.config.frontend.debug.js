const path = require('path');
var nodeExternals = require('webpack-node-externals');
module.exports = {
    output: {
        path: path.join('.','build'),
        filename: 'frontend-compiled-debug.js'
    },
    target: "node",
    name: "Frontend Server",
    entry: path.join(".", "src", "frontend", "index.tsx"),
    externals: [nodeExternals()],
    devtool: 'cheap-module-source-map',
    module: {
        rules: [
            {
              test: /\.(tsx|ts)$/,
              use:[
                {
                  loader: 'babel-loader'
                },
                {
                  loader: 'ts-loader'
                },
                {
                  loader: 'css-loader'
                },
                {
                  loader: 'sass-loader'
                },
                {
                  loader: 'style-loader'
                },
                {
                  loader: 'url-loader'
                }
              ]
            }
        ]
    },
}