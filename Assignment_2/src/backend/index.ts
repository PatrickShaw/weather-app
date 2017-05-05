import * as SocketIo from 'socket.io';
import * as chalk from 'chalk';

import { FullLambdaWeatherService } from './FullLambdaWeatherService';
import { MelbourneWeatherClientFactory } from '../weather_client/melbourne/MelbourneWeatherClientFactory';

console.log(chalk.cyan('Starting server...'));

const io: SocketIO.Server = SocketIo.listen(8080);
const weatherClientFactory: MelbourneWeatherClientFactory = new MelbourneWeatherClientFactory();

const service: FullLambdaWeatherService = new FullLambdaWeatherService(
  io,
  weatherClientFactory
);
service.run();


