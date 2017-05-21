import { LocationMarkerInformation } from './GoogleWeatherMap';
class WeatherMapState {
  public locationInfo: LocationMarkerInformation[];
  public locationPins: google.maps.Marker[] = [];
  public locationHeatMap: google.maps.Circle[] = [];
  // public locationLatLangMap: Map<string, google.maps.LatLang>;
  
  constructor(locationInfo: LocationMarkerInformation[]) {
    this.locationInfo = locationInfo;
  }

  public setLocationInfo(locationInfo: LocationMarkerInformation[]) {
    this.locationInfo = locationInfo;
  }

  public clearPins() {
    for (const pin of this.locationPins) {
      // pin.setVisible(false);
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
