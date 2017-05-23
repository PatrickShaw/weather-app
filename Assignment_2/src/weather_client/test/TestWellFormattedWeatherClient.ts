import { RainfallData } from '../../model/RainfallData';
import { TemperatureData } from '../../model/TemperatureData';
import { TestWeatherClient } from './TestWeatherClient';

import * as moment from 'moment';

class TestWeatherWellFormattedClient extends TestWeatherClient {
  protected createDummyRainfallData(location: string, forceRefresh: boolean): RainfallData {
    return new RainfallData(
      (Math.random() * 100).toString(), 
      moment(new Date()).format('DD/MM/YYYY HH:mm:ss')
    );
  }

  protected createDummyTemperatureData(location: string, forceRefresh: boolean): TemperatureData {
    return new TemperatureData(
      (Math.random() * 40).toString(),
      moment(new Date()).format('DD/MM/YYYY HH:mm:ss')
    );
  }

}

export { TestWeatherWellFormattedClient };
export default TestWeatherWellFormattedClient;
