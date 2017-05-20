process.env.NODE_ENV = 'development';
const chalk = require('chalk')
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackDebugConfig = require('../config/webpack.config.frontend');
const paths = require('../config/paths');
console.log(chalk.cyan('Creating Webpack development server configuration...'));
const useHttps = process.env.HTTPS === 'true';
const protocolPrefix = useHttps ? 'https' : 'http'
const host = process.env.HOST || 'localhost';
const port = parseInt(process.env.PORT, 10) || 3000;
var compiler = webpack(
  webpackDebugConfig, 
  (error) => {
    if(error) {
      console.error(chalk.red('An error occurred when configuring webpack compiler...'))
      console.error(chalk.red(error));
      return;
    }
    console.log(chalk.green('Webpack configuration complete'));
  }
);
var server = new WebpackDevServer(
  compiler,
  {
    compress: true,
    hot:true,
    contentBase: paths.appPublic,
    quiet: false,
    watchOptions: {
      ignored: /node_modules/
    },
    https: useHttps,
    host: host, 
    stats: {
      colors: true
    },
    'clientLogLevel': 'none'
  }
);
console.log(chalk.cyan('Hosting server...'));
server.listen(port, (err) => {
  if(err) {
    console.error(chalk.red('An error occurred when hosting the server...'))
    console.error(chalk.red(err));
    return;
  }
  console.log(chalk.green(`Running frontend server on port ${protocolPrefix}://${host}:${port}`));
});