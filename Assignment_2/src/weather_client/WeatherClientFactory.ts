import { WeatherClient } from './WeatherClient';
interface WeatherClientFactory<T extends WeatherClient> {
  createWeatherClient(): Promise<T>;
}
export { WeatherClientFactory };
export default WeatherClientFactory;
