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
        extensions: ['.ts', 'tsx', '.js', '.jsx']
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
            },
            {
              exclude: [
                /\.html$/,
                // We have to write /\.(js|jsx)(\?.*)?$/ rather than just /\.(js|jsx)$/
                // because you might change the hot reloading server from the custom one
                // to Webpack's built-in webpack-dev-server/client?/, which would not
                // get properly excluded by /\.(js|jsx)$/ because of the query string.
                // Webpack 2 fixes this, but for now we include this hack.
                // https://github.com/facebookincubator/create-react-app/issues/1713
                /\.(js|jsx)(\?.*)?$/,
                /\.(ts|tsx)(\?.*)?$/,
                /\.css$/,
                /\.json$/,
                /\.svg$/
              ],
              loader: 'url-loader',
              query: {
                limit: 10000,
                name: 'static/media/[name].[hash:8].[ext]'
              }
            },
            // "postcss" loader applies autoprefixer to our CSS.
            // "css" loader resolves paths in CSS and adds assets as dependencies.
            // "style" loader turns CSS into JS modules that inject <style> tags.
            // In production, we use a plugin to extract that CSS to a file, but
            // in development "style" loader enables hot editing of CSS.
            {
              test: /\.css$/,
              loader: 'style!css?importLoaders=1!postcss'
            },
            // JSON is not enabled by default in Webpack but both Node and Browserify
            // allow it implicitly so we also enable it.
            {
              test: /\.json$/,
              loader: 'json'
            },
            // "file" loader for svg
            {
              test: /\.svg$/,
              loader: 'file',
              query: {
                name: 'static/media/[name].[hash:8].[ext]'
              }
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