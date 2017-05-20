const {CheckerPlugin} = require('awesome-typescript-loader');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const WebpackShellPlugin = require('webpack-shell-plugin');

function createWebpackBackend(entryDirectory)
{
    return {
        output: {
            path: path.resolve(path.join('.', 'backend-build')),
            filename: 'backend-compiled-debug.js'
        },
        resolve: {
            extensions: ['.ts', 'tsx', '.js', '.jsx']
        },
        bail: true,
        target: 'node',
        name: 'Backend Server',
        entry: entryDirectory,
        externals: [nodeExternals()],
        devtool: 'source-map',
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
                                configFileName: 'tsconfig.backend.json',
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new CheckerPlugin(),
            new WebpackShellPlugin({onBuildEnd: ['node ./backend-build/backend-compiled-debug.js']})
        ],
        stats: {
            errors: true,
            colors: true,
            modules: true,
            reasons: true,
            errorDetails: true
        }
    }
}

module.exports = createWebpackBackend;
