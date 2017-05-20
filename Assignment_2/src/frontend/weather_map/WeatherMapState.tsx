import { LocationMarkerInformation } from './GoogleWeatherMap';

class WeatherMapState {
  public locationInfo: LocationMarkerInformation[];
  
  constructor(locationInfo: LocationMarkerInformation[]) {
    this.locationInfo = locationInfo;
  }

  public setLocationInfo(locationInfo: LocationMarkerInformation[]) {
    this.locationInfo = locationInfo;
  }
}

export { WeatherMapState };
export default { WeatherMapState };
