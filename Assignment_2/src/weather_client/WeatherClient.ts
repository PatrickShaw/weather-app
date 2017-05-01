import { WeatherLocationData } from '../model/WeatherLocationData';
interface WeatherClient {
  retrieveLocations(): Promise<string[]>;
  retrieveWeatherLocationData(locations: string[]): Promise<WeatherLocationData[]>;
}
export { WeatherClient };
export default WeatherClient;
