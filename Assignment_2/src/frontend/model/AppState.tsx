import { LocationMetadata } from './LocationMetadata';
import { LocationServicePrefixer } from '../LocationServicePrefixer';
import { MonitoredLocationInformation } from './MonitoredLocationInformation';
import { observable, action } from 'mobx';
class AppState {
  @observable
  public readonly sortedLocations: LocationMetadata[];
  // weatherDataMap is responsible for keeping track of cards to render.
  // Maps locations to MonitoredLocationInformation which has what information needs to be rendered.
  // So weatherDataMap holds all info that a location needs to render for all locations.
  @observable
  public readonly weatherDataMap: Map<string, MonitoredLocationInformation>;
  // Whether or not the frontend has fully connected to the server
  @observable
  private connectedToServer: boolean;
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
  @action
  public insertServiceLocation(servicePrefix: string, location: string): void {
    // Uses a binary search in an attempt to improve performance.
    let min: number = 0;
    let max: number = this.sortedLocations.length - 1;
    let mid: number = 0;
    while (min <= max) {
      mid = Math.floor((min + max) / 2);
      const searchedLocation: string = this.sortedLocations[mid].location;
      if (searchedLocation < location) {
        min = mid + 1;
      } else if (searchedLocation > location) {
        max = mid - 1;
      } else {
        // It already exists but we need to add in our service's prefix.
        this.sortedLocations[mid].addServicePrefix(LocationServicePrefixer.prefixLocation(servicePrefix, location));
        return;
      }
    }
    // Since the location doesn't exist yet, add it in.
    const locationSet: Set<string> = new Set<string>();
    locationSet.add(LocationServicePrefixer.prefixLocation(servicePrefix, location));
    this.sortedLocations.splice(mid + 1, 0, new LocationMetadata(location, locationSet));
  }

  @action
  public setConnectedToServer(connectedToServer: boolean) {
    this.connectedToServer = connectedToServer;
  }

  public getConnectedToServer(): boolean {
    return this.connectedToServer;
  }
}

export {AppState};
export default {AppState};
