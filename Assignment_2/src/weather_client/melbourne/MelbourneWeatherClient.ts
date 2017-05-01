import * as chalk from 'chalk';

import { MelbourneWeatherSoapServiceStub } from './MelbourneWeatherSoapServiceStub';
import { RainfallData } from '../../model/RainfallData';
import { RainfallRequestData } from '../../model/RainfallRequestData';
import { TemperatureData } from '../../model/TemperatureData';
import { TemperatureRequestData } from '../../model/TemperatureRequestData';
import { WeatherClient } from '../WeatherClient';
import { WeatherLocationData } from '../../model/WeatherLocationData';

/**
 * Creates a client, designed for the MelbourneWeather2 web service which listeners can be added to.
 */
class MelbourneWeatherClient implements WeatherClient {
  // Instance variables.
  private weatherService: MelbourneWeatherSoapServiceStub;

  // Default constructor.
  constructor(melbourneWeatherSoapClient: MelbourneWeatherSoapServiceStub) {
    this.weatherService = melbourneWeatherSoapClient;
  }

  /**
   * Accesses SOAP Client to get rainfall data. Returns a promise. 
   * Upon successful completion, returns rainfallStrings (parsed from the rainfallResponse).
   * rainfallStrings is of form 'timestamp,rainfall in mm'.
   * It can be accessed with a outer .then() propagating it up.
   */
  public retrieveRainfallData(rainfallRequestData: RainfallRequestData): Promise<RainfallData> {
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
  public retrieveTemperatureData(temperatureRequestData: TemperatureRequestData): Promise<TemperatureData> { 
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
  
  public retrieveWeatherLocationData(location: string, getRainfall: boolean = true, getTemperature: boolean = true) {
    if (!getRainfall && !getTemperature) {
      throw new Error('getRainfall and getTemperature were both false');
    }
    const dataPromises: Array<Promise<RainfallData | TemperatureData>> = [];
    let temperatureData: TemperatureData = null;
    let rainfallData: RainfallData = null;
    if (getTemperature) {
      const temperatureRequestPromise: Promise<TemperatureData> = 
          this.retrieveTemperatureData(new TemperatureRequestData(location))
            .then((retrievedTemperatureData) => {
              temperatureData = retrievedTemperatureData;
              return temperatureData;
            });
      dataPromises.push(temperatureRequestPromise);
    }
    if (getRainfall) {
      const rainfallRequestPromise: Promise<RainfallData> = 
        this.retrieveRainfallData(new RainfallRequestData(location))
          .then((retrievedRainfallData) => {
            rainfallData = retrievedRainfallData;
            return rainfallData;
          });
      dataPromises.push(rainfallRequestPromise);
    }      
    // Wait for both getRainfall() and getTemperature() promises to resolve.
    return Promise.all(dataPromises)
        .then((responses) => {
          const weatherData: WeatherLocationData = new WeatherLocationData(
              location,
              rainfallData,
              temperatureData
          );
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
}

export { MelbourneWeatherClient };
export default MelbourneWeatherClient;
