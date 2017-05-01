import { } from '../weather_client/Melbourne';

import * as SocketIo from 'socket.io';
import * as chalk from 'chalk';

import { FullLambdaService } from './FullLambdaService';
import { MelbourneWeatherClientFactory } from '../weather_client/melbourne/MelbourneWeatherClientFactory';

// Listen to port 8080 for our socket.io server.
console.log(chalk.cyan('Starting server...'));
const io: SocketIO.Server = SocketIo.listen(8080);
const weatherClientFactory: MelbourneWeatherClientFactory = new MelbourneWeatherClientFactory();
const service: FullLambdaService = new FullLambdaService(
  io, 
  weatherClientFactory
);
service.run();
