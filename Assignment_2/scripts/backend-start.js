const chalk = require('chalk')
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackDebugConfig = require('../config/webpack.config.backend.debug');
console.log(chalk.cyan("Creating Webpack development server configuration..."));
const useHttps = process.env.HTTPS === 'true';
const host = process.env.HOST || 'localhost';
const port = parseInt(process.env.PORT, 10) || 8080;
var compiler = webpack(
  webpackDebugConfig, 
  (error) => {
    if(error) {
      console.error(chalk.red("An error occurred when configuring webpack compiler..."))
      console.error(chalk.red(error));
      return;
    }
    console.log(chalk.green("Webpack configuration complete"));
  }
);
/*
var server = new WebpackDevServer(
  compiler,
  {
    compress: true,
    hot: true,
    publicPath: '/',
    quiet: false,
    watchOptions: {
      ignored: /node_modules/
    },
    https: useHttps,
    host: host,
    hot: false,
    stats: {
      colors: true
    }
  }
);
console.log(chalk.cyan("Hosting server..."));
server.listen(port, (err) => {
  if(err) {
    console.error(chalk.red("An error occurred when hosting the server..."))
    console.error(chalk.red(err));
    return;
  }
  console.log(chalk.green(`Running backend server on port ${host}:${port}`));
});*/