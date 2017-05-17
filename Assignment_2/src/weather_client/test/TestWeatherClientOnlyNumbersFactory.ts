import { TestWeatherClientOnlyNumbers } from './TestWeatherClientOnlyNumbers';
import { WeatherClientFactory } from '../WeatherClientFactory';
/**
 * Creates offline test environment test clients
 */
class TestWeatherClientOnlyNumbersFactory implements WeatherClientFactory<TestWeatherClientOnlyNumbers> {
  public createWeatherClient(): Promise<TestWeatherClientOnlyNumbers> {
    return new Promise((resolve, reject) => {
      resolve(new TestWeatherClientOnlyNumbers());
    });
  }
}
export { TestWeatherClientOnlyNumbersFactory };
export default TestWeatherClientOnlyNumbersFactory;
