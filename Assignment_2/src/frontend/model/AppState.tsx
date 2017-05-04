import { WeatherLocationData } from '../../model/WeatherLocationData';

class AppState {
  public readonly locations: string[];
  // weatherDataList is responsible for keeping track of cards to render.
  public readonly weatherDataMap: Map<string, WeatherLocationData>;
  // Whether or not the frontend has fully connected to the server
  public readonly connectedToServer: boolean;

  constructor(
    locations: string[],
    weatherDataMap: Map<string, WeatherLocationData>,
    connectedToServer: boolean
  ) {
    this.locations = locations;
    this.weatherDataMap = weatherDataMap;
    this.connectedToServer = connectedToServer;
  }
}

export {AppState};
export default {AppState};
