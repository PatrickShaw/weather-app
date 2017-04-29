/**
 * Class to hold data to be sent to SOAP client to retrieve rainfall data.
 */
class RainfallRequestData {
  private readonly parameters: string;

  constructor(parameters: string) {
    this.parameters = parameters;
  }

  public getParameters(): string {
    return this.parameters;
  }
  
}

export {RainfallRequestData};
export default RainfallRequestData;
