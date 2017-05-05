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

  public toString(): string {
    return `${this.temperature} at time ${this.timestamp}`;
  }
}

export {TemperatureData};
export default TemperatureData;
