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
}

export {RainfallData};
export default RainfallData;
