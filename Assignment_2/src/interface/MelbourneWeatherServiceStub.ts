import { RainfallRequestData } from '../model/RainfallRequestData';
import { TemperatureRequestData } from '../model/TemperatureRequestData';

/**
 * Interface for SOAP Weather client. 
 */
interface MelbourneWeatherServiceStub {
  // Get a List of locations.
  getLocations(): Promise<any>;
  // Get rainfallRequestData.
  getRainfall(rainfallRequestData: RainfallRequestData): Promise<any>;
  // Get temperatureRequestData.
  getTemperature(temperatureRequestData: TemperatureRequestData): Promise<any>;
}

export {MelbourneWeatherServiceStub};
export default MelbourneWeatherServiceStub;
