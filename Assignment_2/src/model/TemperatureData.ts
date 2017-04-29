/**
 * Class that represents temperature data.
 */
class TemperatureData {
  private readonly temperature: string;
  private readonly timestamp: string;

  constructor(temperature: string, timestamp: string) {
    this.temperature = temperature;
    this.timestamp = timestamp;
  }

  public getTemperature(): string {
    return this.temperature;
  }

  public getTimestamp(): string {
    return this.timestamp;
  }
}
export {TemperatureData};
export default TemperatureData;
