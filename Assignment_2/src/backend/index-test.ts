import * as chalk from 'chalk';
import * as Http from 'http';
import * as SocketIo from 'socket.io';
import { FullLambdaService } from './FullLambdaService';
import { TestWeatherClientFactory } from '../weather_client/test/TestWeatherClientFactory';
console.log(chalk.cyan('Starting server...'));
const server = Http.createServer();
server.listen(8080);
const io: SocketIO.Server = SocketIo(server);
const weatherClientFactory: TestWeatherClientFactory = new TestWeatherClientFactory();
const service: FullLambdaService = new FullLambdaService(
  io, 
  weatherClientFactory
);
service.run();
