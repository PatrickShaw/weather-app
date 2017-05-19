import { RainfallData } from '../../model/RainfallData';
import { TemperatureData } from '../../model/TemperatureData';
import { TestWeatherClient } from './TestWeatherClient';

class TestWeatherClientOnlyNumbers extends TestWeatherClient {

  protected createDummyRainfallData(location: string, forceRefresh: boolean): RainfallData {
    return new RainfallData(
      (Math.random() * 100).toString(), 
      (Math.random() * 40).toString()
    );
  }

  protected createDummyTemperatureData(location: string, forceRefresh: boolean): TemperatureData {
    return new TemperatureData(
      (Math.random() * 40).toString(),
      (Math.random() * 40).toString()
    );
  }

}

export { TestWeatherClientOnlyNumbers };
export default TestWeatherClientOnlyNumbers;
