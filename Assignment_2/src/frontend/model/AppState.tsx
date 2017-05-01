import { WeatherLocationData } from '../../model/WeatherLocationData';

class AppState {
  public readonly locations: string[];
  // weatherDataList is responsible for keeping track of cards to render.
  public readonly weatherDataList: WeatherLocationData[];
  // monitoredLocations is responsible for keeping track of greyed out sidebar.
  public readonly monitoredLocations: Set<string>;
  // Whether or not the frontend has fully connected to the server
  public readonly connectedToServer: boolean;

  constructor(
    locations: string[],
    weatherDataList: WeatherLocationData[],
    monitoredLocations: Set<string>,
    connectedToServer: boolean
  ) {
    this.locations = locations;
    this.weatherDataList = weatherDataList;
    this.monitoredLocations = monitoredLocations;
    this.connectedToServer = connectedToServer;
  }
}

export {AppState};
export default {AppState};
