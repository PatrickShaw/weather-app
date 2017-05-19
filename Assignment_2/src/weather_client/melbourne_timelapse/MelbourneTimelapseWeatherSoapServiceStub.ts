import { SoapResponse } from '../../model/SoapResponse';
import { SoapRequest } from '../../model/SoapRequest';
interface MelbourneTimelapseWeatherSoapServiceStub {
  // Get a List of locations.
  getLocations(): Promise<SoapResponse<string[]>>;
  getWeather(parameters: SoapRequest<string>): Promise<SoapResponse<string[]>>;
}

export {MelbourneTimelapseWeatherSoapServiceStub};
export default MelbourneTimelapseWeatherSoapServiceStub;
