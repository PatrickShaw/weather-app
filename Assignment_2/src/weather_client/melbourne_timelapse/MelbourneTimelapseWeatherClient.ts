import * as chalk from 'chalk';

import { MelbourneTimelapseWeatherSoapServiceStub } from './MelbourneTimelapseWeatherSoapServiceStub';
import { RainfallData } from '../../model/RainfallData';
import { TemperatureData } from '../../model/TemperatureData';
import { WeatherClient } from '../WeatherClient';
import { WeatherLocationData } from '../../model/WeatherLocationData';

/**
 * A client designed to retrieve data from the SOAP MelbourneWeather2 API. Supports limited in memory 
 * caching to limit the number of calls to the SOAP client. The client DOES NOT handle connections to the 
 * SOAP client itself.
 */
class MelbourneTimelapseWeatherClient implements WeatherClient {
  // Instance variables.
  private weatherService: MelbourneTimelapseWeatherSoapServiceStub;
  // Default constructor.
  constructor(
    melbourneWeatherSoapClient: MelbourneTimelapseWeatherSoapServiceStub
  ) {
    this.weatherService = melbourneWeatherSoapClient;
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
    location: string, // The weather data's associated location.
    getRainfall: boolean = true, // Whether we want to get the rainfall data for this location.
    getTemperature: boolean = true, // Whether we want to get the temperature data for this location.
    forceRefresh: boolean = true // Whether we want to retrieve the data regardless of whether it's cached.
  ) {
    if (!getRainfall && !getTemperature) {
      // Obviously the caller shouldn't bother calling this method if don't actually want to get any
      // meaningful data.
      throw new Error('getRainfall and getTemperature were both false');
    }
    // We're going to use this to wait for all requests later on.
    const dataPromises: Array<Promise<string[]>> = [];
    dataPromises.push(
      this.weatherService.getWeather(location)
        .then((data) => {
          console.log(data);
          return data;
        })
    );
    // Now let's check if we should make actual calls to the SOAP client.
    // Wait for both getRainfall() and getTemperature() promises to resolve.
    return Promise.all(dataPromises)
      .then((responses) => {
        const weatherData: WeatherLocationData = new WeatherLocationData(
            location,
            new RainfallData('TODO', 'TODO'),
            new TemperatureData('TODO', 'TODO')
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

export { MelbourneTimelapseWeatherClient };
export default MelbourneTimelapseWeatherClient;
