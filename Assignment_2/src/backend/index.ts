import * as SocketIo from 'socket.io';
import * as chalk from 'chalk';

import { FullLambdaService } from './FullLambdaService';

// import { MonitorMetadata } from '../model/MonitorMetadata';
// import { MonitoringManager } from '../monitor/MonitoringManager';
// import { MonitoringSessionManager } from '../monitor/MonitoringSessionManager';
// import { OnLocationsRetrievedListener } from '../interface/OnLocationsRetrievedListener';
// import { OnWeatherRetrievedListener } from '../interface/OnWeatherRetrievedListener';
// import { WeatherLocationData } from '../model/WeatherLocationData';

  // Setup web sockets.
  // Listen to port 8080, frontend connects to port 8080.
const w = SocketIo.listen(8080);

const server = new FullLambdaService(w);
console.log(chalk.bgGreen('Start Server'));
server.run();

console.log(chalk.bgMagenta('How did this happen'));
