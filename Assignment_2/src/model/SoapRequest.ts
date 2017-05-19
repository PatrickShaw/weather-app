class SoapRequest<T> {
  constructor(data: T) {
    this.parameters = data;
  }
  public readonly parameters: T;
}
export {SoapRequest};
export default SoapRequest;
