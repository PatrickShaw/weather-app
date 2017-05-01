import { WeatherLocationData } from '../../model/WeatherLocationData';

class AppState {
  public readonly locations: string[];
  // weatherDataList is responsible for keeping track of cards to render.
  public readonly weatherDataList: WeatherLocationData[];
  // monitoredLocations is responsible for keeping track of greyed out sidebar.
  public readonly monitoredLocations: Set<string>;
  
  constructor(
    locations: string[],
    weatherDataList: WeatherLocationData[],
    monitoredLocations: Set<string>
  ) {
    this.locations = locations;
    this.weatherDataList = weatherDataList;
    this.monitoredLocations = monitoredLocations;
  }
}

export {AppState};
export default {AppState};
