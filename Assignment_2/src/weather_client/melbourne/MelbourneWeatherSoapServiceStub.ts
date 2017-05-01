import { RainfallRequestData } from '../../model/RainfallRequestData';
import { TemperatureRequestData } from '../../model/TemperatureRequestData';
interface SoapResponse<T> {
  return: T;
}
interface MelbourneWeatherSoapServiceStub {
  // Get a List of locations.
  getLocations(): Promise<SoapResponse<string[]>>;
  // Get rainfallRequestData.
  getRainfall(rainfallRequestData: RainfallRequestData): Promise<SoapResponse<string[]>>;
  // Get temperatureRequestData.
  getTemperature(temperatureRequestData: TemperatureRequestData): Promise<SoapResponse<string[]>>;
}

export {MelbourneWeatherSoapServiceStub};
export default MelbourneWeatherSoapServiceStub;
