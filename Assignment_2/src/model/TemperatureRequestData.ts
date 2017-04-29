/**
 * Class to hold data to be sent to SOAP client to retrieve temperature data.
 */
class TemperatureRequestData {
  private readonly parameters: string;

  constructor(parameters: string) {
    this.parameters = parameters;
  }

  public getParameters(): string {
    return this.parameters;
  }
  
}

export {TemperatureRequestData};
export default TemperatureRequestData;
