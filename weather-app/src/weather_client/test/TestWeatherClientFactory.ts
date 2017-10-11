import { TestWeatherClient } from './TestWeatherClient';
import { WeatherClientFactory } from '../WeatherClientFactory';
/**
 * Creates offline test environment test clients
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
