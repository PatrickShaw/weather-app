import * as Http from 'http';
import * as SocketIo from 'socket.io';
import * as chalk from 'chalk';

import { FullLambdaWeatherService } from './FullLambdaWeatherService';
import { TestWellFormattedWeatherClientFactory } from '../weather_client/test/TestWellFormattedWeatherClientFactory';

console.log(chalk.cyan('Starting server...'));
const server = Http.createServer();
server.listen(8080);
const io: SocketIO.Server = SocketIo(server);
const weatherClientFactory: TestWellFormattedWeatherClientFactory = new TestWellFormattedWeatherClientFactory();
const service: FullLambdaWeatherService = new FullLambdaWeatherService(
  io, 
  weatherClientFactory
);
service.run();
