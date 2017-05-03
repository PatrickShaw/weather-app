/**
 * Class to hold data to be sent to SOAP client to retrieve temperature data.
 */
class TemperatureRequestData {
  public readonly parameters: string;
  constructor(parameters: string) {
    this.parameters = parameters;
  }
}

export {TemperatureRequestData};
export default TemperatureRequestData;
