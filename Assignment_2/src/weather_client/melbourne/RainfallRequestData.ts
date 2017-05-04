/**
 * Class to hold data to be sent to SOAP client to retrieve rainfall data.
 */
class RainfallRequestData {
  public readonly parameters: string;
  constructor(parameters: string) {
    this.parameters = parameters;
  }
}

export {RainfallRequestData};
export default RainfallRequestData;
