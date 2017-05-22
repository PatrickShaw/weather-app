import * as SocketIo from 'socket.io';
import * as chalk from 'chalk';

import { FullLambdaWeatherService } from './FullLambdaWeatherService';
import {
  MelbourneTimelapseWeatherClientFactory,
} from '../weather_client/melbourne_timelapse/MelbourneTimelapseWeatherClientFactory';

// import { MelbourneWeatherClientFactory } from '../weather_client/melbourne/MelbourneWeatherClientFactory';


console.log(chalk.cyan('Starting server...'));

const io: SocketIO.Server = SocketIo.listen(8080);

const weatherClientFactory: MelbourneTimelapseWeatherClientFactory = new MelbourneTimelapseWeatherClientFactory();
// const weatherClientFactory: MelbourneWeatherClientFactory = new MelbourneWeatherClientFactory();

const service: FullLambdaWeatherService = new FullLambdaWeatherService(
  io,
  weatherClientFactory,
  30000
);
service.run();


