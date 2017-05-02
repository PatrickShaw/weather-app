import chalk from 'chalk';
import { WeatherLocationData } from '../model/WeatherLocationData';
/**
 * Provides caching mechanism so new frontend sessions that connect can display monitors instantly.
 * TODO: Maybe move to a database without changing methods for stage 2.
 */
class LocationCache {
  private locationMap: Map<string, WeatherLocationData>;

  constructor() {
    this.locationMap = new Map<string, WeatherLocationData>();
  }

  /**
   * Add a location to map, location must not already exist in map.
   */
  public addLocation(location: string, data: WeatherLocationData): void {
    if (this.locationMap.has(location)) {
      throw new Error(`location ${location} already exists in ${this.locationMap}`);
    }
    this.locationMap.set(location, data);
    console.log(chalk.red(`Add location ${location} to cache`));
  }

  /**
   * Update a location in map, location has to previously exist in map.
   */
  public updateLocation(location: string, data: WeatherLocationData): void {
    if (!this.locationMap.has(location)) {
      throw new Error(`location ${location} doesn't exist in ${this.locationMap}, can't update`);
    }
    this.locationMap.set(location, data);
    console.log(chalk.red(`Update location ${location} in cache`));
  }

  /**
   * If location is not in map will add, else updates.
   */
  public setLocation(location: string, data: WeatherLocationData): void {
    this.locationMap.set(location, data);
    console.log(chalk.cyan(`Set location ${location} in cache`));
  }

  public has(location: string): boolean {
    return this.locationMap.has(location);
  }

  // Return weather data associated with a location.
  public get(location: string): WeatherLocationData {
    return this.locationMap.get(location);
  }
}
export {LocationCache};
export default LocationCache;
