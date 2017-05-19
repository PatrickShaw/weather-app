import * as Http from 'http';
import * as SocketIo from 'socket.io';
import * as chalk from 'chalk';

import { FullLambdaWeatherService } from './FullLambdaWeatherService';
import { TestWeatherClientOnlyNumbersFactory } from '../weather_client/test/TestWeatherClientOnlyNumbersFactory';

console.log(chalk.cyan('Starting server...'));
const server = Http.createServer();
server.listen(8080);
const io: SocketIO.Server = SocketIo(server);
const weatherClientFactory: TestWeatherClientOnlyNumbersFactory = new TestWeatherClientOnlyNumbersFactory();
const service: FullLambdaWeatherService = new FullLambdaWeatherService(
  io, 
  weatherClientFactory
);
service.run();
