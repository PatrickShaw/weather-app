import * as chalk from 'chalk';

import {WeatherLocationData} from '../model/WeatherLocationData';

class LocationCache {
  private locationMap: Map<string, WeatherLocationData>;

  constructor() {
    this.locationMap = new Map<string, WeatherLocationData>();
  }

  public addLocation(location: string, data: WeatherLocationData) {
    if (this.locationMap.has(location)) {
      throw new Error(`location ${location} already exists in ${this.locationMap}`);
    }
    this.locationMap.set(location, data);
    console.log(chalk.red(`Add location ${location} to cache`));
  }

  public updateLocation(location: string, data: WeatherLocationData) {
    if (!this.locationMap.has(location)) {
      throw new Error(`location ${location} doesn't exist in ${this.locationMap}, can't update`);
    }
    this.locationMap.set(location, data);
    console.log(chalk.red(`Update location ${location} in cache`));
  }

  /**
   * If location is not in map will add, else updates.
   * @param location 
   * @param data 
   */
  public setLocation(location: string, data: WeatherLocationData) {
    this.locationMap.set(location, data);
    console.log(chalk.cyan(`Set location ${location} in cache`));
  }

  public has(location: string) {
    return this.locationMap.has(location);
  }

  // Return weather data associated with a location.
  public get(location: string) {
    return this.locationMap.get(location);
  }

}
export {LocationCache};
export default LocationCache;
