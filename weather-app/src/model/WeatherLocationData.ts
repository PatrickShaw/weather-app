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

  constructor(location: string, rainfallData?: RainfallData, temperatureData?: TemperatureData) {
    this.location = location;
    this.rainfallData = rainfallData;
    this.temperatureData = temperatureData;
  } 

  public toString(): string {
    const temp: string = this.temperatureData ? this.temperatureData.toString() : 'undefined';
    const rainfall: string = this.rainfallData ? this.rainfallData.toString() : 'undefined';
    return `Location: ${this.location}, Rainfall: ${rainfall}, Temperature: ${temp}`;
  }
}

export {WeatherLocationData};
export default WeatherLocationData;
