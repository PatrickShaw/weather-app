import * as chalk from 'chalk';

import { MelbourneWeatherSoapServiceStub } from './MelbourneWeatherSoapServiceStub';
import { RainfallData } from '../../model/RainfallData';
import { RainfallRequestData } from './RainfallRequestData';
import { TemperatureRequestData } from './TemperatureRequestData';
import { TemperatureData } from '../../model/TemperatureData';
import { WeatherClient } from '../WeatherClient';
import { WeatherLocationData } from '../../model/WeatherLocationData';
import { LocationCache } from '../../cache/LocationCache';
/**
 * Creates a client, designed for the MelbourneWeather2 web service which listeners can be added to.
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
    return this.weatherService.getLocations().then((locationsResponse) => {
      // locationsResponse is an object locationsResponse.return gives the data as an string.
      return locationsResponse.return;
    }).catch((error) => {
      return error;
    });
  }
  
  public retrieveWeatherLocationData(
    location: string, 
    getRainfall: boolean = true, 
    getTemperature: boolean = true,
    forceRefresh: boolean = true
  ) {
    if (!getRainfall && !getTemperature) {
      throw new Error('getRainfall and getTemperature were both false');
    }
    const dataPromises: Array<Promise<RainfallData | TemperatureData>> = [];
    let temperatureData: TemperatureData;
    let rainfallData: RainfallData;
    if (!forceRefresh) {
      let cachedWeatherData: WeatherLocationData | undefined;
      cachedWeatherData = this.locationCache.get(location);
      if (cachedWeatherData === undefined) {
        rainfallData = getRainfall ? cachedWeatherData.rainfallData : null;
        temperatureData = getTemperature ? cachedWeatherData.temperatureData : null;
      }
    }
    if (getTemperature) {
      if (temperatureData !== undefined) {
        temperatureData = cachedWeatherData.temperatureData;
      } else {
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
            });
        dataPromises.push(temperatureRequestPromise);
      }
    }
    if (getRainfall) {
      if (rainfallData !== undefined) {
        rainfallData = cachedWeatherData.rainfallData;
      } else {
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
        if (this.locationCache.has(weatherData)) {
          this.locationCache.updateLocation(weatherData);
        } else {
          this.locationCache.addLocation(weatherData);
        }
        return weatherData;
      }).catch((error) => {
        console.error(chalk.bgRed('Error: Promise.all(compileWeatherLocationDataPromises)'));
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
      .then((rainfallResponse) => {
        // rainfallResponse is an object, .return will return the data in that object as a string[].
        const rainfallStrings: string[] = rainfallResponse.return;
        return new RainfallData(rainfallStrings[1], rainfallStrings[0]);
      })
      .catch((error) => {
        console.error(chalk.bgRed('Error: getRainfall()'));
        console.error(chalk.red(error.message));
        console.error(chalk.red(error.stack));
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
        .then((temperatureResponse) => {
          const temperatureStrings: string[] = temperatureResponse.return;
          return new TemperatureData(temperatureStrings[1], temperatureStrings[0]);
        })
        .catch((error) => {
          console.error(chalk.bgRed('Error: getTemperature()'));
          console.error(chalk.red(error.message));
          console.error(chalk.red(error.stack));
        });
  }
}

export { MelbourneWeatherClient };
export default MelbourneWeatherClient;
