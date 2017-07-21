const {CheckerPlugin} = require('awesome-typescript-loader');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const fs = require('fs');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const paths = require('./paths');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const autoprefixer = require('autoprefixer');
const publicPath = '/';
const publicUrl = '';
const postcssPlugins = [autoprefixer];
module.exports = {
    output: {
        path: paths.appBuild,
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
    },  
    name: 'Frontend Server',
    entry: ['babel-polyfill', paths.appIndexJs],
    devtool: 'source-map',
    module: {
        rules: [
            // TSLint gives us suggestions on how to keep the app more consistant and correct with 
            // TypeScript standards.
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
              exclude: [
                /\.html$/,
                /\.(js|jsx)$/,
                /\.(ts|tsx)$/,
                /\.css$/,
                /\.sass$/,
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
            // Transpiles TypeScript and TypeScript + JSX into plain old JavaScript
            // Babel is used to imporve compatbility with older browsers
            {
                test: /\.(ts|tsx)$/,
                use: [
                    {
                        loader: 'babel-loader'
                    },
                    {   
                        loader: 'awesome-typescript-loader',
                        options: {
                            configFileName: 'tsconfig.frontend.json',
                            useBabel: true,
                            useCache: true,
                        }
                    }
                ]
            },
            // Although we don't use CSS in the app, these are loaders that will allow us to use CSS 
            // if we ever need to. E.g. Swapping currently style sheets for a framework.
            {
              test: /\.css$/,
              exclude: [/node_modules/],
              use: [
                {
                  loader: 'style-loader'
                },
                {
                  loader: 'css-loader',
                  options: {
                      sourceMap: true
                  }
                }, 
                {
                    loader: 'postcss-loader',
                    options: {
                        plugins: () => {
                            return postcssPlugins;
                        }
                    }
                }
              ],
            },
            // JSON loader lets us use JSON files in the app (if we choose to use them)
            {
              test: /\.json$/,
              loader: 'json-loader'
            },
            // File loader lets us use SVGs in the app (if we choose to use them)
            {
              test: /\.svg$/,
              loader: 'file-loader',
              query: {
                name: 'static/media/[name].[hash:8].[ext]'
              }
            }
        ]
    },
    plugins: [
        new CheckerPlugin(),
        new HtmlWebpackPlugin({
          inject: 'body',
          template: paths.appHtml
        }),
        new webpack.HotModuleReplacementPlugin(),
        new CaseSensitivePathsPlugin()
        // new StyleLintPlugin({ syntax: 'scss'}) uncomment this one day.
    ],
    stats: {
        colors: true,
        modules: true,
        reasons: true,
        errorDetails: true
    },
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    }
}