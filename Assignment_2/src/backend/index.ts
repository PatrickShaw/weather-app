import * as SocketIo from 'socket.io';
import * as chalk from 'chalk';

import { FullLambdaWeatherService } from './FullLambdaWeatherService';
import {
  MelbourneTimelapseWeatherClientFactory,
} from '../weather_client/melbourne_timelapse/MelbourneTimelapseWeatherClientFactory';
import {
  MelbourneWeatherClientFactory
} from '../weather_client/melbourne/MelbourneWeatherClientFactory';
// import { MelbourneWeatherClientFactory } from '../weather_client/melbourne/MelbourneWeatherClientFactory';


console.log(chalk.cyan('Starting server...'));

new FullLambdaWeatherService(
  SocketIo.listen(8080),
  new MelbourneWeatherClientFactory(),
  3000
).run();
new FullLambdaWeatherService(
  SocketIo.listen(8081),
  new MelbourneTimelapseWeatherClientFactory(),
  3000
).run();
