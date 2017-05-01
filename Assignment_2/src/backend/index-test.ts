import * as SocketIo from 'socket.io';
import * as chalk from 'chalk';

import { FullLambdaService } from './FullLambdaService';
import { TestWeatherClientFactory } from '../weather_client/test/TestWeatherClientFactory';

console.log(chalk.cyan('Starting test server...'));
new FullLambdaService(
  SocketIo.listen(8080), 
  new TestWeatherClientFactory()
).run();
