import * as chalk from 'chalk';

import { MelbourneWeatherServiceStub } from '../interface/MelbourneWeatherServiceStub';
import { OnLocationsRetrievedListener } from '../interface/OnLocationsRetrievedListener';
import { OnWeatherRetrievedListener } from '../interface/OnWeatherRetrievedListener';
import { RainfallData } from '../model/RainfallData';
import { RainfallRequestData } from '../model/RainfallRequestData';
import { TemperatureData } from '../model/TemperatureData';
import { TemperatureRequestData } from '../model/TemperatureRequestData';
import { WeatherLocationData } from '../model/WeatherLocationData';
import { WeatherClient } from './WeatherClient';

/**
 * Creates a client, designed for the MelbourneWeather2 web service which listeners can be added to.
 */
class MelbourneWeatherClient implements WeatherClient {
  // Instance variables.
  private weatherService: MelbourneWeatherServiceStub;
  private onWeatherPollCompleteListeners: OnWeatherRetrievedListener[];
  private onLocationsPollCompleteListeners: OnLocationsRetrievedListener[];

  // Default constructor.
  constructor(melbourneWeatherSoapClient: MelbourneWeatherServiceStub) {
    this.weatherService = melbourneWeatherSoapClient;
    this.onWeatherPollCompleteListeners = [];
    this.onLocationsPollCompleteListeners = [];
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
    const weatherLocationDataList: WeatherLocationData[] = new Array<WeatherLocationData>(locations.length);
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
      const compileWeatherLocationDataPromises: Array<Promise<any>> 
        = [temperatureRequestPromise, rainfallRequestPromise];
      Promise.all(compileWeatherLocationDataPromises)
      .then((responses) => {
        // Create new WeatherLocationData object with rainfallData object and temperatureData object 
        // when promises resolved.
        const weatherData: WeatherLocationData = new WeatherLocationData(location, rainfallData, temperatureData);
        weatherLocationDataList[locationIndex] = weatherData;
      }).catch((error) => {
        console.error(chalk.bgRed('Error: Promise.all(compileWeatherLocationDataPromises)'));
        console.error(chalk.red(error.message));
        console.error(chalk.red(error.stack));
      });
      // Add promises to ensure all promises resolve before sending off data.
      weatherPromises.push(rainfallRequestPromise);
      weatherPromises.push(temperatureRequestPromise);
    });
    return Promise.all(weatherPromises);
  } 
}

export {MelbourneWeatherClient};
export default MelbourneWeatherClient;
