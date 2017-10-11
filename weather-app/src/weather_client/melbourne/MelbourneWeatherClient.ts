import * as chalk from 'chalk';

import { LocationCache } from '../../cache/LocationCache';
import { MelbourneWeatherSoapServiceStub } from './MelbourneWeatherSoapServiceStub';
import { RainfallData } from '../../model/RainfallData';
import { RainfallRequestData } from './RainfallRequestData';
import { SoapResponse } from '../../model/SoapResponse';
import { TemperatureData } from '../../model/TemperatureData';
import { TemperatureRequestData } from './TemperatureRequestData';
import { WeatherClient } from '../WeatherClient';
import { WeatherLocationData } from '../../model/WeatherLocationData';

/**
 * A client designed to retrieve data from the SOAP MelbourneWeather2 API. Supports limited in memory 
 * caching to limit the number of calls to the SOAP client. The client DOES NOT handle connections to the 
 * SOAP client itself.
 */
class MelbourneWeatherClient implements WeatherClient {
  // Instance variables.
  private weatherService: MelbourneWeatherSoapServiceStub;
  private locationCache: LocationCache;
  // Default constructor.
  constructor(
    melbourneWeatherSoapClient: MelbourneWeatherSoapServiceStub, 
    locationCache: LocationCache = new LocationCache()
  ) {
    this.weatherService = melbourneWeatherSoapClient;
    this.locationCache = locationCache;
  }

  /**
   * Retrieve locations from SOAP client endpoint.
   */
  public retrieveLocations(): Promise<string[]> {
    return this.weatherService.getLocations().then((locationsResponse: SoapResponse<string[]>) => {
      // locationsResponse is an object locationsResponse.return gives the data as an string.
      return locationsResponse.return;
    }).catch((error) => {
      return error;
    });
  }
  
  // Only retrieve weather location data for a single location.
  public retrieveWeatherLocationData(
    location: string, // The weather data's associated location.
    getRainfall: boolean = true, // Whether we want to get the rainfall data for this location.
    getTemperature: boolean = true, // Whether we want to get the temperature data for this location.
    forceRefresh: boolean = true // Whether we want to retrieve the data regardless of whether it's cached.
  ): Promise<WeatherLocationData> {
    // Should not happen.
    if (location == null) {
      throw new Error('Location was null in retrieveWeatherLocationData');
    }
    if (!getRainfall && !getTemperature) {
      // Obviously the caller shouldn't bother calling this method if don't actually want to get any
      // meaningful data.
      throw new Error('getRainfall and getTemperature were both false');
    }
    // We're going to use this to wait for all requests later on.
    const dataPromises: Array<Promise<RainfallData | TemperatureData>> = [];
    // We're going to use these currently undefined variables to populate the weather data later on.
    let temperatureData: TemperatureData;
    let rainfallData: RainfallData;
    // Okay, let's see if we can grab ourselve's some cached data.
    
    if (!forceRefresh) {
      let cachedWeatherData: WeatherLocationData | undefined;
      cachedWeatherData = this.locationCache.get(location);
      if (cachedWeatherData !== undefined) {
        rainfallData = getRainfall ? cachedWeatherData.rainfallData : undefined;
        temperatureData = getTemperature ? cachedWeatherData.temperatureData : undefined;
      }
    }

    const cacheEntryCorrect: boolean = rainfallData !== undefined && temperatureData !== undefined;
    // Now let's check if we should make actual calls to the SOAP client.
    if (getTemperature) {
      if (temperatureData === undefined) {
        const temperatureRequestPromise: Promise<TemperatureData> = 
          this.retrieveTemperatureData(new TemperatureRequestData(location))
            .then((retrievedTemperatureData) => {
              temperatureData = retrievedTemperatureData;
              return temperatureData;
            })
            .catch((error) => {
              console.error(chalk.bgRed('Error: retrieveTemperatureData()'));
              console.error(chalk.red(error.message));
              console.error(chalk.red(error.stack));
              throw error;
            });
        dataPromises.push(temperatureRequestPromise);
      }
    }
    if (getRainfall) {
      if (rainfallData === undefined) {
        const rainfallRequestPromise: Promise<RainfallData> = 
          this.retrieveRainfallData(new RainfallRequestData(location))
            .then((retrievedRainfallData) => {
              rainfallData = retrievedRainfallData;
              return rainfallData;
            })
            .catch((error) => {
              console.error(chalk.bgRed('Error: retrieveRainfallData()'));
              console.error(chalk.red(error.message));
              console.error(chalk.red(error.stack));
              throw error;
            });
        dataPromises.push(rainfallRequestPromise);
      }
    }      
    // Wait for both getRainfall() and getTemperature() promises to resolve.
    return Promise.all(dataPromises)
      .then((responses) => {
        const weatherData: WeatherLocationData = new WeatherLocationData(
            location,
            rainfallData,
            temperatureData
        );
        if (this.locationCache.has(weatherData) && !cacheEntryCorrect) {
          this.locationCache.updateLocation(weatherData);
        } else if (!this.locationCache.has(weatherData)) {
          this.locationCache.addLocation(weatherData);
        }
        return weatherData;
      }).catch((error) => {
        console.error(chalk.bgRed(`Error: retrieveWeatherDataLocation 
          >> Promise.all(compileWeatherLocationDataPromises)`));
        console.error(chalk.red(error.message));
        console.error(chalk.red(error.stack));
      });
  }

  /**
   * Retrieve weather data from SOAP client endpoint based on locations.
   * @param locations Locations to get data for.
   */
  public retrieveWeatherLocationDataList(locations: string[]): Promise<WeatherLocationData[]> {
    const weatherPromises: Array<Promise<WeatherLocationData>> = [];
    // For each location, get temp and rainfall data.
    locations.forEach((location: string, locationIndex: number) => {
      if (location == null) {
        console.log(chalk.red(`Location is null: ${location}`));
      }
      // Force refresh of location cache as defaults forceRefresh to true.
      weatherPromises.push(this.retrieveWeatherLocationData(location));
    });
    return Promise.all(weatherPromises);
  } 
  
  /**
   * Accesses SOAP Client to get rainfall data. Returns a promise. 
   * Upon successful completion, returns rainfallStrings (parsed from the rainfallResponse).
   * rainfallStrings is of form 'timestamp,rainfall in mm'.
   * It can be accessed with a outer .then() propagating it up.
   */
  private retrieveRainfallData(rainfallRequestData: RainfallRequestData): Promise<RainfallData> {
    // Note: SOAP lib is async, Promise.then to do work after async call.
    return this.weatherService.getRainfall(rainfallRequestData)
      .then((rainfallResponse: SoapResponse<string[]>) => {
        // rainfallResponse is an object, .return will return the data in that object as a string[].
        const rainfallStrings: string[] = rainfallResponse.return;
        return new RainfallData(rainfallStrings[1], rainfallStrings[0]);
      })
      .catch((error) => {
        console.error(chalk.bgRed('Error: getRainfall()'));
        console.error(chalk.red(error.message));
        console.error(chalk.red(error.stack));
        throw error;
      });
  }

  /**
   * Accesses SOAP Client to get temperature data. Returns a promise. 
   * Upon successful completion, returns temperatureStrings (parsed from the temperatureResponse).
   * temperatureStrings is of form 'timestamp,temperature in degrees celsius'.
   * It can be accessed with a outer .then() propagating it up.
   */
  private retrieveTemperatureData(temperatureRequestData: TemperatureRequestData): Promise<TemperatureData> { 
    return this.weatherService.getTemperature(temperatureRequestData)
        .then((temperatureResponse: SoapResponse<string[]>) => {
          const temperatureStrings: string[] = temperatureResponse.return;
          return new TemperatureData(temperatureStrings[1], temperatureStrings[0]);
        })
        .catch((error) => {
          console.error(chalk.bgRed('Error: getTemperature()'));
          console.error(chalk.red(error.message));
          console.error(chalk.red(error.stack));
          throw error;
        });
  }
}

export { MelbourneWeatherClient };
export default MelbourneWeatherClient;
