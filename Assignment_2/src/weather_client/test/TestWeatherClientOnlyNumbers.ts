import { RainfallData } from '../../model/RainfallData';
import { TemperatureData } from '../../model/TemperatureData';
import { TestWeatherClient } from './TestWeatherClient';

class TestWeatherClientOnlyNumbers extends TestWeatherClient {

  protected createDummyRainfallData(location: string, forceRefresh: boolean): RainfallData {
    const n: number = Math.random() * 100;

    return new RainfallData(
      n.toString(), 
      'sample time'
    );
  }

  protected createDummyTemperatureData(location: string, forceRefresh: boolean): TemperatureData {
    const n: number = Math.random() * 100;
    return new TemperatureData(
      n.toString(),
      'sample time'
    );
  }

}

export { TestWeatherClientOnlyNumbers };
export default TestWeatherClientOnlyNumbers;
