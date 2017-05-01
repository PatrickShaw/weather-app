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
   * Retrieve locations from SOAP client endpoint.
   */
  public retrieveLocations(): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
        this.weatherService.getLocations().then((locationsResponse) => {
        // locationsResponse is an object locationsResponse.return gives the data as an string.
        const locations: string[] = locationsResponse.return;
        resolve(locations);
      }).catch((error) => {
        reject(error);
      });
    });
  }
  
  /**
   * Retrieve weather data from SOAP client endpoint based on locations.
   * @param locations Locations to get data for.
   */
  public retrieveWeatherLocationData(locations: string[]): Promise<WeatherLocationData[]> {
    const weatherPromises: Array<Promise<any>> = [];
    // For each location, get temp and rainfall data.
    locations.forEach((location: string, locationIndex: number) => {
      let temperatureData: TemperatureData;
      let rainfallData: RainfallData;
      // Note: SOAP lib is async, Promise.then to do work after async call.
      const temperatureRequestPromise: Promise<any> = 
        this.weatherService.getTemperature(new TemperatureRequestData(location))
        .then((temperatureResponse) => {
          // temperatureResponse is an object, .return will return the data in that object as a string[].
          const temperatureStrings: string[] = temperatureResponse.return;
          temperatureData = new TemperatureData(temperatureStrings[1], temperatureStrings[0]);
        })
        .catch((error) => {
          console.error(chalk.bgRed('Error: getTemperature()'));
          console.error(chalk.red(error.message));
          console.error(chalk.red(error.stack));
        });

      const rainfallRequestPromise: Promise<any> = 
        this.weatherService.getRainfall(new RainfallRequestData(location))
        .then((rainfallResponse) => {
          const rainfallStrings: string[] = rainfallResponse.return;
          rainfallData = new RainfallData(rainfallStrings[1], rainfallStrings[0]);
        })
        .catch((error) => {
          console.error(chalk.bgRed('Error: getRainfall()'));
          console.error(chalk.red(error.message));
          console.error(chalk.red(error.stack));
        });
      
      // Wait for both getRainfall() and getTemperature() promises to resolve.
      const weatherLocationPromise: Promise<WeatherLocationData> = new Promise<WeatherLocationData>(
        (resolve, reject) => {
          Promise.all([temperatureRequestPromise, rainfallRequestPromise]).then((responses) => {
            const weatherData: WeatherLocationData = new WeatherLocationData(
                location,
                rainfallData,
                temperatureData
            );
            resolve(weatherData);
          }).catch((error) => {
            reject(error);
          });
        }
      ).catch((error) => {
        console.error(chalk.bgRed('Error: Promise.all(compileWeatherLocationDataPromises)'));
        console.error(chalk.red(error.message));
        console.error(chalk.red(error.stack));
      });
      weatherPromises.push(weatherLocationPromise);
    });
    return Promise.all(weatherPromises);
  } 
}

export {MelbourneWeatherClient };
export default MelbourneWeatherClient;
