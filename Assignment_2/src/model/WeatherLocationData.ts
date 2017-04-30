import { RainfallData } from './RainfallData';
import { TemperatureData } from './TemperatureData';
/**
 * Class that represents weather data.
 * Has a location, RainfallData object and TemperatureData object.
 */
class WeatherLocationData {
  public readonly location: string;
  public readonly rainfallData?: RainfallData;
  public readonly temperatureData?: TemperatureData;

  constructor(location: string, rainfallData: RainfallData, temperatureData: TemperatureData) {
    this.location = location;
    this.rainfallData = rainfallData;
    this.temperatureData = temperatureData;
  } 
}

export {WeatherLocationData};
export default WeatherLocationData;
