import { MonitoredLocationInformation } from './MonitoredLocationInformation';

class AppState {
  public readonly locations: string[];
  // weatherDataMap is responsible for keeping track of cards to render.
  // Maps locations to MonitoredLocationInformation which has what information needs to be rendered.
  // So weatherDataMap holds all info that a location needs to render for all locations.
  public readonly weatherDataMap: Map<string, MonitoredLocationInformation>;
  // Whether or not the frontend has fully connected to the server
  public readonly connectedToServer: boolean;
  constructor(
    locations: string[],
    weatherDataMap: Map<string, MonitoredLocationInformation>,
    connectedToServer: boolean
  ) {
    this.locations = locations;
    this.weatherDataMap = weatherDataMap;
    this.connectedToServer = connectedToServer;
  }
}

export {AppState};
export default {AppState};
