import { TestWeatherWellFormattedClient } from './TestWellFormattedWeatherClient';
import { WeatherClientFactory } from '../WeatherClientFactory';
/**
 * Creates offline test environment test clients
 */
class TestWellFormattedWeatherClientFactory implements WeatherClientFactory<TestWeatherWellFormattedClient> {
  public createWeatherClient(): Promise<TestWeatherWellFormattedClient> {
    return new Promise((resolve, reject) => {
      resolve(new TestWeatherWellFormattedClient());
    });
  }
}
export { TestWellFormattedWeatherClientFactory };
export default TestWellFormattedWeatherClientFactory;
