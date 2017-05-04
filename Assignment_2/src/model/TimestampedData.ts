/**
 * A piece of client data that holds a timestamp.
 */
abstract class TimestampedData {
  public readonly timestamp: string;

  constructor(timestamp: string) {
    if (timestamp === '') {
      // Handle no data from SOAP client.
      this.timestamp = 'N/A';
    } else {
      this.timestamp = timestamp;
    }
  }
}

export {TimestampedData};
export default TimestampedData;
