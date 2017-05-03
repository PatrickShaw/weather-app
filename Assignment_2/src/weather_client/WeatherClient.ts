import { WeatherLocationData } from '../model/WeatherLocationData';

interface WeatherClient {
  retrieveLocations(): Promise<string[]>;
  retrieveWeatherLocationDataList(locations: string[]): Promise<WeatherLocationData[]>;
  retrieveWeatherLocationData(
    location: string, 
    getRainfall: boolean, 
    getTemperature: boolean,
    forceRefresh: boolean
  ): Promise<WeatherLocationData>;
}
export { WeatherClient };
export default WeatherClient;
