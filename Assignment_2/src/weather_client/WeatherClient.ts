import { WeatherLocationData } from '../model/WeatherLocationData';
import { TemperatureData } from '../model/TemperatureData';
import { RainfallData } from '../model/RainfallData';
import { RainfallRequestData } from '../model/RainfallRequestData';
import { TemperatureRequestData } from '../model/TemperatureRequestData';

interface WeatherClient {
  retrieveLocations(): Promise<string[]>;
  retrieveWeatherLocationDataList(locations: string[]): Promise<WeatherLocationData[]>;
  retrieveRainfallData(rainfallRequestData: RainfallRequestData): Promise<RainfallData>;
  retrieveTemperatureData(temperatureRequestData: TemperatureRequestData): Promise<TemperatureData>;
  retrieveWeatherLocationData(
    location: string, 
    getRainfall: boolean, 
    getTemperature: boolean
  ): Promise<WeatherLocationData>;
}
export { WeatherClient };
export default WeatherClient;
