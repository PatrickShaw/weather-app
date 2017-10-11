import * as SocketIo from 'socket.io';

import { FullLambdaWeatherService } from './FullLambdaWeatherService';
import {
MelbourneTimelapseWeatherClientFactory,
} from '../weather_client/melbourne_timelapse/MelbourneTimelapseWeatherClientFactory';
import {
  MelbourneWeatherClientFactory,
} from '../weather_client/melbourne/MelbourneWeatherClientFactory';

// Original Melbourne Weather Service, poll every 5 mins.
new FullLambdaWeatherService(
  SocketIo.listen(8081),
  new MelbourneWeatherClientFactory(),
  300000
).run();

// New Melbourne Timelapse Weather Service, poll every 20 seconds.
new FullLambdaWeatherService(
  SocketIo.listen(8080),
  new MelbourneTimelapseWeatherClientFactory(),
  20000
).run();
