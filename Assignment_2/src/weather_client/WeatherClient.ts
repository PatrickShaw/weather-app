import { WeatherLocationData } from '../model/WeatherLocationData';
import { TemperatureData } from '../model/TemperatureData';
import { RainfallData } from '../model/RainfallData';
import { RainfallRequestData } from '../model/RainfallRequestData';
import { TemperatureRequestData } from '../model/TemperatureRequestData';

interface WeatherClient {
  retrieveLocations(): Promise<string[]>;
  retrieveWeatherLocationData(locations: string[]): Promise<WeatherLocationData[]>;
  retrieveRainfallData(rainfallRequestData: RainfallRequestData): Promise<RainfallData>;
  retrieveTemperatureData(temperatureRequestData: TemperatureRequestData): Promise<TemperatureData>;
}
export { WeatherClient };
export default WeatherClient;
