/**
 * Class that represents rainfall data.
 */
class RainfallData {
  private readonly rainfall: string;
  private readonly timestamp: string;

  constructor(rainfall: string, timestamp: string) {
    this.rainfall = rainfall;
    this.timestamp = timestamp;
  }

  public getRainfall(): string {
    return this.rainfall;
  }

  public getTimestamp(): string {
    return this.timestamp;
  }
  
}

export {RainfallData};
export default RainfallData;
