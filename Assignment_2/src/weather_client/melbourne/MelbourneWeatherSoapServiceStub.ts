import { RainfallRequestData } from '../../model/RainfallRequestData';
import { TemperatureRequestData } from '../../model/TemperatureRequestData';

interface MelbourneWeatherSoapServiceStub {
  // Get a List of locations.
  getLocations(): Promise<any>;
  // Get rainfallRequestData.
  getRainfall(rainfallRequestData: RainfallRequestData): Promise<any>;
  // Get temperatureRequestData.
  getTemperature(temperatureRequestData: TemperatureRequestData): Promise<any>;
}

export {MelbourneWeatherSoapServiceStub};
export default MelbourneWeatherSoapServiceStub;
