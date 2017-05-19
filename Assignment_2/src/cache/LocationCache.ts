import * as chalk from 'chalk';

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
  public addLocation(data: WeatherLocationData): void {
    if (this.locationMap.has(data.location)) {
      throw new Error(`location ${data.location} already exists in cache`);
    }
    this.locationMap.set(data.location, data);
    console.log(chalk.green(`Added location ${data.location} to cache`));
  }

  /**
   * Update a location in map, location has to previously exist in map.
   */
  public updateLocation(data: WeatherLocationData): void {
    if (!this.locationMap.has(data.location)) {
      throw new Error(`location ${data.location} doesn't exist in cache, can't update`);
    }
    this.locationMap.set(data.location, data);
    console.log(chalk.green(`Updated location ${data.location} in cache`));
  }

  public hasLocation(location: string): boolean {
    return this.locationMap.has(location);
  }

  public has(weatherData: WeatherLocationData): boolean {
    return this.locationMap.has(weatherData.location);
  }

  // Return weather data associated with a location.
  public get(location: string): WeatherLocationData {
    return this.locationMap.get(location);
  }
}
export {LocationCache};
export default LocationCache;
