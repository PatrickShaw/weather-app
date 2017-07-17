import { LocationMetadata } from './LocationMetadata';
import { LocationServicePrefixer } from '../LocationServicePrefixer';
import { MonitoredLocationInformation } from './MonitoredLocationInformation';
import { observable } from 'mobx';
class AppState {
  @observable
  public sortedLocations: LocationMetadata[];
  // weatherDataMap is responsible for keeping track of cards to render.
  // Maps locations to MonitoredLocationInformation which has what information needs to be rendered.
  // So weatherDataMap holds all info that a location needs to render for all locations.
  @observable
  public weatherDataMap: Map<string, MonitoredLocationInformation>;
  // Whether or not the frontend has fully connected to the server
  @observable
  public connectedToServer: boolean;
  constructor(
    sortedLocations: LocationMetadata[],
    weatherDataMap: Map<string, MonitoredLocationInformation>,
    connectedToServer: boolean
  ) {
    this.sortedLocations = sortedLocations;
    this.weatherDataMap = weatherDataMap;
    this.connectedToServer = connectedToServer;
  }
  
  /**
   * Inserts a location into the location list without breaking the order.
   */
  public static insertServiceLocation(appState: AppState, servicePrefix: string, location: string): void {
    // Uses a binary search in an attempt to improve performance.
    let min: number = 0;
    let max: number = appState.sortedLocations.length - 1;
    let mid: number = 0;
    while (min <= max) {
      mid = Math.floor((min + max) / 2);
      const searchedLocation: string = appState.sortedLocations[mid].location;
      if (searchedLocation < location) {
        min = mid + 1;
      } else if (searchedLocation > location) {
        max = mid - 1;
      } else {
        // It already exists but we need to add in our service's prefix.
        appState.sortedLocations[mid].prefixedLocations.add(
          LocationServicePrefixer.prefixLocation(servicePrefix, location)
        );
        return;
      }
    }
    // Since the location doesn't exist yet, add it in.
    const locationSet: Set<string> = new Set<string>();
    locationSet.add(LocationServicePrefixer.prefixLocation(servicePrefix, location));
    appState.sortedLocations.splice(mid + 1, 0, new LocationMetadata(location, locationSet));
  }
}

export {AppState};
export default {AppState};
