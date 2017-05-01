import * as chalk from 'chalk';

import { MelbourneWeatherServiceStub } from '../interface/MelbourneWeatherServiceStub';
import { OnLocationsRetrievedListener } from '../interface/OnLocationsRetrievedListener';
import { OnWeatherRetrievedListener } from '../interface/OnWeatherRetrievedListener';
import { RainfallData } from '../model/RainfallData';
import { RainfallRequestData } from '../model/RainfallRequestData';
import { TemperatureData } from '../model/TemperatureData';
import { TemperatureRequestData } from '../model/TemperatureRequestData';
import { WeatherLocationData } from '../model/WeatherLocationData';

/**
 * Creates a client, designed for the MelbourneWeather2 web service which listeners can be added to.
 */
class MelbourneWeatherClient {
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
   * Add a listener to this.onWeatherPollCompleteListeners which is be triggered 
   * when retrieveWeatherData() is completed.
   * @param addedListener Object that implements OnWeatherRetrievedListener.
   */
  public addOnWeatherRetrievedListener(addedListener: OnWeatherRetrievedListener): void {
    this.onWeatherPollCompleteListeners.push(addedListener);
  }
  
  /**
   * Remove a listener from this.onWeatherPollCompleteListeners.
   * @param removedListener Listener to remove.
   */
  public removeOnWeatherRetrievedListener(removedListener: OnWeatherRetrievedListener): void {
    this.onWeatherPollCompleteListeners.filter((listener) => {
      return listener !== removedListener;
    });
  }
  
  /**
   * Add a listener to this.onLocationsPollCompleteListeners which is triggered when 
   * retrieveLocations() is completed.
   * @param addedListener Object that implements OnLocationsRetrievedListener.
   */
  public addOnLocationsRetrievedListener(addedListener: OnLocationsRetrievedListener): void {
    this.onLocationsPollCompleteListeners.push(addedListener);
  }
  
  /**
   * Remove a listener from this.onLocationsPollCompleteListeners.
   * @param removedListener Listener to remove.
   */
  public removeOnLocationsRetrievedListener(removedListener: OnLocationsRetrievedListener): void {
    this.onLocationsPollCompleteListeners.filter((listener) => {
      return listener !== removedListener;
    });
  }
  
  /**
   * Accesses SOAP Client to get location data. Returns a promise. 
   * Upon successful completion, returns locations (parsed from the locationsResponse).
   * locations is of form string[].
   * It can be accessed with a outer .then() propagating it up.
   */
  private getLocations(): Promise<any> {
    return this.weatherService.getLocations()
    .then((locationsResponse) => {
      // locationsResponse is an object locationsResponse.return gives the data as an string.
      const locations: string[] = locationsResponse.return;
      console.log((`${chalk.cyan('getLocations() inner promise return locations:')} ${locations}`));      
      return locations;
    })
    .catch((error) => {
      console.error(chalk.red(error.message));
      console.error(chalk.red(error.stack));
    });
  }

  /**
   * Accesses SOAP Client to get rainfall data. Returns a promise. 
   * Upon successful completion, returns rainfallStrings (parsed from the rainfallResponse).
   * rainfallStrings is of form 'timestamp,rainfall in mm'.
   * It can be accessed with a outer .then() propagating it up.
   */
  public getRainfall(rainfallRequestData: RainfallRequestData): Promise<any> {
    return this.weatherService.getRainfall(rainfallRequestData)
      .then((rainfallResponse) => {
        // rainfallResponse is an object, .return will return the data in that object as a string[].
        const rainfallStrings: string[] = rainfallResponse.return;
        console.log((`${chalk.cyan('getRainfall() inner promise return rainfall strings:')} 
          ${rainfallStrings}`)
        );        
        // rainfallStrings propagates up to next .then().
        return rainfallStrings;
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
  public getTemperature(temperatureRequestData: TemperatureRequestData): Promise<any> { 
    return this.weatherService.getTemperature(temperatureRequestData)
      .then((temperatureResponse) => {
        // temperatureResponse is an object, .return will return the data in that object as a string[].
        const temperatureStrings: string[] = temperatureResponse.return;
        console.log((`${chalk.cyan('getTemperature() inner promise return temperature strings:')} 
          ${temperatureStrings}`)
        );
        // temperatureStrings propagates up to next .then().
        return temperatureStrings;
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
  public retrieveLocations(): void {
    this.getLocations()
    .then((locations) => {
      // locationsResponse is of type string[].
      this.onLocationsPollCompleteListeners.forEach(
        (onLocationsPollCompleteListener: OnLocationsRetrievedListener) => {
          // For each listener, call onLocationsRetrieved() to process weather data locations.
          onLocationsPollCompleteListener.onLocationsRetrieved(locations);
        }
      );
    })
    .catch((error) => {
      console.error(chalk.bgRed('Error: getLocations()'));
      console.error(chalk.red(error.message));
      console.error(chalk.red(error.stack));    });
  }
  
  /**
   * Retrieve weather data from SOAP client endpoint based on locations.
   * @param locations Locations to get data for.
   */
  public retrieveWeatherData(locations: string[]): void {
    const weatherLocationDataList: WeatherLocationData[] = new Array<WeatherLocationData>(locations.length);
    const weatherPromises: Array<Promise<any>> = [];
    // For each location, get temp and rainfall data.
    locations.forEach((location: string, locationIndex: number) => {
      // Note: SOAP lib is async, Promise.then to do work after async call.

      let temperatureData: TemperatureData;    
      // Wrap location in a TemperatureRequestData object.
      const temperatureRequestData = new TemperatureRequestData(location);
      const temperatureRequestPromise: Promise<any> = this.getTemperature(temperatureRequestData);
      // Assign temperatureData when promise is resolved.
      temperatureRequestPromise.then((temperatureStrings) => {
        console.log(`${chalk.cyan('Retrieved temperature strings:')} ${temperatureStrings}`);
        temperatureData = new TemperatureData(temperatureStrings[1], temperatureStrings[0]);
      }).catch((error) => {
        console.error(chalk.red(error.message));
        console.error(chalk.red(error.stack));
      });

      let rainfallData: RainfallData;
      // Wrap location in a RainfallRequestData object.
      const rainfallRequestData = new RainfallRequestData(location);
      const rainfallRequestPromise: Promise<any> = this.getRainfall(rainfallRequestData);
      // Assign rainfallData when promise is resolved.
      rainfallRequestPromise.then((rainfallStrings) => {
        console.log(`${chalk.cyan('Retrieved rainfall strings:')} ${rainfallStrings}`);
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
    Promise.all(weatherPromises).then((responses) => {
      //  For each listener, send data off to frontend.
      this.onWeatherPollCompleteListeners.forEach((onWeatherPollCompleteListener) => {
        onWeatherPollCompleteListener.onWeatherRetrieved(weatherLocationDataList);
      });
    }).catch((error) => {
      console.error(chalk.bgRed('Error: onWeatherPollCompleteListener.onWeatherRetrieved()'));
      console.error(chalk.red(error.message));
      console.error(chalk.red(error.stack));
    });
  } 
}

export {MelbourneWeatherClient};
export default MelbourneWeatherClient;
