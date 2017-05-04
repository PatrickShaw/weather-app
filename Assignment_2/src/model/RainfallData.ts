import { TimestampedData } from './TimestampedData';
/**
 * Class that represents rainfall data.
 */
class RainfallData extends TimestampedData {
  public readonly rainfall: string;

  constructor(rainfall: string, timestamp: string) {
    super(timestamp);
    this.rainfall = rainfall;
  }  

  public toString(): string {
    return `${this.rainfall} at time ${this.timestamp}`;
  }
}

export {RainfallData};
export default RainfallData;
