import { LocationMarkerInformation } from './GoogleWeatherMap';

class WeatherMapState {
  public locationInfo: LocationMarkerInformation[];
  public locationPins: google.maps.Marker[] = [];
  public locationHeatMap: google.maps.Circle[] = [];
  
  constructor(locationInfo: LocationMarkerInformation[]) {
    this.locationInfo = locationInfo;
  }

  public setLocationInfo(locationInfo: LocationMarkerInformation[]) {
    this.locationInfo = locationInfo;
  }

  public clearPins() {
    for (const pin of this.locationPins) {
      pin.setMap(null);
    }
    this.locationPins = [];
  }

  public clearCircles() {
    for (const circle of this.locationHeatMap) {
      circle.setMap(null);
    }
    this.locationHeatMap = [];
  }

}

export { WeatherMapState };
export default { WeatherMapState };
