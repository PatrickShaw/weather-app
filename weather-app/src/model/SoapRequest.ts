class SoapRequest<T> {
  public readonly parameters: T;

  constructor(data: T) {
    this.parameters = data;
  }
}
export {SoapRequest};
export default SoapRequest;
