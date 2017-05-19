interface SoapResponse<T> {
  return: T;
}
interface MelbourneTimelapseWeatherSoapServiceStub {
  // Get a List of locations.
  getLocations(): Promise<SoapResponse<string[]>>;
  getWeather(location: string): Promise<string[]>;
}

export {MelbourneTimelapseWeatherSoapServiceStub};
export default MelbourneTimelapseWeatherSoapServiceStub;
