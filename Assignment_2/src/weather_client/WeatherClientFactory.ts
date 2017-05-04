import { WeatherClient } from './WeatherClient';
/**
 * An abstract factory for creating various different types of weather clients.
 */
interface WeatherClientFactory<T extends WeatherClient> {
  createWeatherClient(): Promise<T>;
}
export { WeatherClientFactory };
export default WeatherClientFactory;
