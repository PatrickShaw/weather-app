import { WeatherLocationData } from '../../model/WeatherLocationData';

class AppState {
  public readonly locations: string[];
  public readonly weatherDataList: WeatherLocationData[];
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
