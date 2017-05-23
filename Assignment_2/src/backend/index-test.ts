import * as SocketIo from 'socket.io';
import * as chalk from 'chalk';

import { FullLambdaWeatherService } from './FullLambdaWeatherService';
import { TestWeatherClientFactory } from '../weather_client/test/TestWeatherClientFactory';
import { TestWellFormattedWeatherClientFactory } from '../weather_client/test/TestWellFormattedWeatherClientFactory';
console.log(chalk.cyan('Starting server...'));

new FullLambdaWeatherService(
  SocketIo.listen(8080),
  new TestWellFormattedWeatherClientFactory(),
  3000
).run();

new FullLambdaWeatherService(
  SocketIo.listen(8081),
  new TestWeatherClientFactory(),
  3000
).run();
