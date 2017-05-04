import * as SocketIo from 'socket.io';

import { FullLambdaWeatherService } from './FullLambdaWeatherService';
import { MelbourneWeatherClientFactory } from '../weather_client/melbourne/MelbourneWeatherClientFactory';

class Driver {
  public main(): void {
    const io: SocketIO.Server = SocketIo.listen(8080);
    const weatherClientFactory: MelbourneWeatherClientFactory = new MelbourneWeatherClientFactory();
    const service: FullLambdaWeatherService = new FullLambdaWeatherService(
      io,
      weatherClientFactory
    );
    service.run();
  }
}

export {Driver};
export default Driver;
