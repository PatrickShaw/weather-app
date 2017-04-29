import RainfallRequestData from './RainfallRequestData';
import TemperatureRequestData from './TemperatureRequestData';

interface MelbourneWeatherServiceStub {
  // TODO: Maybe get rid of null?
  getLocations(): Promise<any>;
  getRainfall(rainfallRequestData: RainfallRequestData): Promise<any>;
  getTemperature(temperatureRequestData: TemperatureRequestData): Promise<any>;
}

export {MelbourneWeatherServiceStub};
export default MelbourneWeatherServiceStub;
