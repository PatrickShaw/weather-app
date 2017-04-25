const {CheckerPlugin} = require('awesome-typescript-loader');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const WebpackShellPlugin = require('webpack-shell-plugin');
module.exports = {
    output: {
        path: path.resolve(path.join('.', "build")),
        filename: 'backend-compiled-debug.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    bail: true,
    target: "node",
    name: "Backend Server",
    entry: './src/backend/index.ts',
    externals: [nodeExternals()],
    devtool: 'cheap-module-source-map',
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.(ts|tsx)$/,
                use: [
                    {
                        loader: 'tslint-loader'
                    }
                ]
            },
            {
                test: /\.(ts|tsx)$/,
                use: [
                    {   
                        loader: 'awesome-typescript-loader',
                        options: {
                            useBabel: true,
                            useCache: true
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new CheckerPlugin(),
        new WebpackShellPlugin({onBuildEnd: ['node ./build/backend-compiled-debug.js']})
    ],
    stats: {
        colors: true,
        modules: true,
        reasons: true,
        errorDetails: true
    }
}