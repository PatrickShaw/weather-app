import { TimestampedData } from './TimestampedData';
/**
 * Class that represents rainfall data.
 */
class RainfallData extends TimestampedData {
  public readonly rainfall: string;

  constructor(rainfall: string, timestamp: string) {
    super(timestamp);

    if (rainfall === '') {
      // Handle no data from SOAP client.
      this.rainfall = 'N/A';
    } else {
      this.rainfall = rainfall;
    }
  }  
}

export {RainfallData};
export default RainfallData;
