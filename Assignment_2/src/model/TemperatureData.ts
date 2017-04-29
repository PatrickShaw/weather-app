import {TimestampedData} from './TimestampedData';
/**
 * Class that represents temperature data.
 */
class TemperatureData extends TimestampedData {
  public readonly temperature: string;

  constructor(temperature: string, timestamp: string) {
    super(timestamp);
    this.temperature = temperature;
  }
}
export {TemperatureData};
export default TemperatureData;
