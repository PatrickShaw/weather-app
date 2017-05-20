const chalk = require('chalk')
const webpack = require('webpack');

function runBackend(config) {
  console.log(chalk.cyan('Creating Webpack development server configuration...'));
  var compiler = webpack(
    config, 
    (error) => {
      if(error) {
        console.error(chalk.red('An error occurred when configuring webpack compiler...'))
        console.error(chalk.red(error));
        return;
      }
      console.log(chalk.green('Webpack configuration complete'));
    }
  );
}

module.exports = runBackend;
