const {CheckerPlugin} = require('awesome-typescript-loader');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const fs = require('fs');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const getClientEnvironment = require('./env');
const publicPath = '/';
const publicUrl = '';
const env = getClientEnvironment(publicUrl);
var appDirectory = fs.realpathSync(process.cwd());
function resolveApp(relativePath) {
  return path.resolve(appDirectory, relativePath);
}
var nodePaths = (process.env.NODE_PATH || '')
  .split(process.platform === 'win32' ? ';' : ':')
  .filter(Boolean)
  .filter(folder => !path.isAbsolute(folder))
  .map(resolveApp);
module.exports = {
    output: {
        path: path.resolve(path.join('.', "build")),
        filename: 'frontend-compiled-debug.js',
        publicPath: publicPath
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: {
          'react-native': 'react-native-web'
        }
    },
    bail: true,
    name: "Frontend Server",
    entry: [
      './src/frontend/index.tsx',
      require.resolve('react-dev-utils/webpackHotDevClient')
    ],
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
            {
                test: /\.(ts|tsx)$/,
                use: [
                    {   
                        loader: 'awesome-typescript-loader',
                        options: {
                            configFileName: 'tsconfig.frontend.json',
                            useBabel: true,
                            useCache: true
                        }
                    }
                ]
            },
            // "postcss" loader applies autoprefixer to our CSS.
            // "css" loader resolves paths in CSS and adds assets as dependencies.
            // "style" loader turns CSS into JS modules that inject <style> tags.
            // In production, we use a plugin to extract that CSS to a file, but
            // in development "style" loader enables hot editing of CSS.
            {
              test: /\.css$/,
              use: [
                {
                  loader: 'style-loader'
                },
                {
                  loader: 'css-loader'
                }
              ]
            },
            // JSON is not enabled by default in Webpack but both Node and Browserify
            // allow it implicitly so we also enable it.
            {
              test: /\.json$/,
              loader: 'json-loader'
            },
            // "file" loader for svg
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
        new InterpolateHtmlPlugin(env.raw),
        new HtmlWebpackPlugin({
          inject: true,
          template: './public/index.html',
        }),
        new webpack.DefinePlugin(env.stringified),
        new webpack.HotModuleReplacementPlugin(),
        new CaseSensitivePathsPlugin(),
        new WatchMissingNodeModulesPlugin('./node_modules')
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