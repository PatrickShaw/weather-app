import { SoapResponse } from '../../model/SoapResponse';
import { RainfallRequestData } from './RainfallRequestData';
import { TemperatureRequestData } from './TemperatureRequestData';
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
