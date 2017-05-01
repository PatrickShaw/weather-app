import { WeatherClientFactory } from '../WeatherClientFactory';
import { TestWeatherClient } from './TestWeatherClient';
/**
 * 
 */
class TestWeatherClientFactory implements WeatherClientFactory<TestWeatherClient> {
  public createWeatherClient(): Promise<TestWeatherClient> {
    return new Promise((resolve, reject) => {
      resolve(new TestWeatherClient());
    });
  }
}
export { TestWeatherClientFactory };
export default TestWeatherClientFactory;
