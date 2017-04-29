import { WeatherLocationData } from '../../model/WeatherLocationData';

class AppState {
  public readonly locations: string[];
  public readonly weatherDataList: WeatherLocationData[];
  constructor(locations: string[], weatherDataList: WeatherLocationData[]) {
    this.locations = locations;
    this.weatherDataList = weatherDataList;
  }
}

export {AppState};
export default {AppState};
