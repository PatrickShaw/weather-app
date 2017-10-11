import * as chalk from 'chalk';

import { LocationCache } from '../../cache/LocationCache';
import { MelbourneTimelapseWeatherSoapServiceStub } from './MelbourneTimelapseWeatherSoapServiceStub';
import { RainfallData } from '../../model/RainfallData';
import { SoapRequest } from '../../model/SoapRequest';
import { SoapResponse } from '../../model/SoapResponse';
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
  private locationCache: LocationCache;

  // Default constructor.
  constructor(
    melbourneWeatherSoapClient: MelbourneTimelapseWeatherSoapServiceStub,
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
  
  // Precondition: Valid cache entry exists.
  private getDataFromCache(getRainfall: boolean, getTemperature: boolean, location: string): WeatherLocationData {
    const weatherData: WeatherLocationData = this.locationCache.get(location);
    let rainfallValue: RainfallData;
    let temperatureValue: TemperatureData;
    // These shouldn't happen but check in case anyways.
    if (!getRainfall && !getTemperature) {
      throw new Error(`getDataFromCache called: getRainfall and getTemperature are false`);
    }
    if (weatherData === undefined) {
      throw new Error(`getDataFromCache: WeatherData is undefined, key: ${location} in location cache.`);
    }

    if (getRainfall) {
      // Need to get rainfall, get from cache.
      const cachedRainfall = weatherData.rainfallData;
      if (cachedRainfall !== undefined) {
        rainfallValue = cachedRainfall;
      } else {
        // Should not happen.
        // Not throwing an error because we can still serve temperature data.
        console.error(chalk.red(`RainfallData is undefined in ${weatherData}`));
      }   
    }
    
    if (getTemperature) {
      // Need to get temperature, get from cache.
      const cachedTemperature = weatherData.temperatureData;
      if (cachedTemperature !== undefined) {
        temperatureValue = cachedTemperature;
      } else {
         // Should not happen.
        // Not throwing an error because we can still serve rainfall data.
        console.error(chalk.red(`TemperatureData is undefined in ${weatherData}`));
      }
    }
    // Return new WeatherLocationData for request rainfall/temp data.
    const weatherDataToReturn: WeatherLocationData =  new WeatherLocationData(
      location,
      rainfallValue,
      temperatureValue
    );
    console.log(chalk.cyan(`Weather data returned from location cache: ${weatherDataToReturn}`));
    return weatherDataToReturn;
  }

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
    let temperatureData: TemperatureData;
    let rainfallData: RainfallData;

    if (!forceRefresh) {
      // If forceRefresh is needed then rainfall data and temp data will always be undefined.
      let cachedWeatherData: WeatherLocationData | undefined;
      cachedWeatherData = this.locationCache.get(location);
      if (cachedWeatherData !== undefined) {
        // Can be undefined/null in cache.
        rainfallData = getRainfall ? cachedWeatherData.rainfallData : undefined;
        temperatureData = getTemperature ? cachedWeatherData.temperatureData : undefined;
      }
    }

    // If forceRefresh then cacheEntryCorrect will always be false.
    // cacheEntryCorrect will only be true if not force refresh and all data is defined which will
    // always be the case if a new session connects that queries for data.
    const cacheEntryCorrect: boolean = rainfallData !== undefined && temperatureData !== undefined;

    let needToGetData: boolean = false;
    if (getRainfall) {
      if (rainfallData === undefined) {
        needToGetData = true;
      }
    }
    if (getTemperature) {
      if (temperatureData === undefined) {
        needToGetData = true;
      }
    }

    let returnPromise: Promise<WeatherLocationData>;
    if (!needToGetData) {
      console.log(chalk.cyan(`retrieveWeatherLocationData: getting data from location cache`));
      // Return value from cache.
      returnPromise = new Promise<WeatherLocationData>((resolve, reject) => {
        const weatherData: WeatherLocationData | undefined = this.locationCache.get(location);
        if (weatherData !== undefined) {
          resolve(this.getDataFromCache(getRainfall, getTemperature, location));
        } else {
          // Should not occur.
          reject(`Location: ${location} not found in location cache`);
        }
      }).then((response: WeatherLocationData) => {
        // Return cache location.
        return response;
      }).catch((error) => {
        console.error(chalk.bgRed(`Error: retrieveWeatherDataLocation 
          MelbourneTimelapseWeatherClient.`));
        console.error(chalk.red(error.message));
        console.error(chalk.red(error.stack));
        throw error;
      });
    } else {
      console.log(chalk.cyan(`retrieveWeatherLocationData: making network request`));
      // Get data, add to cache and return data.
      returnPromise = this.weatherService.getWeather(new SoapRequest<string>(location))
        .then((response: SoapResponse<string[]>) => {
          const data: string[] = response.return;
          const timestamp: string = data[0];
          const rainfall: string = data[2];
          let temperature: string = data[1];
          const tempCelsius: number = parseFloat(temperature) - 273.15;
          temperature = '' + tempCelsius;  // Converted to celsius.
          const weatherData: WeatherLocationData =  new WeatherLocationData(
            location, 
            new RainfallData(rainfall, timestamp), 
            new TemperatureData(temperature, timestamp)
          );
          // Add into location cache here.
          if (this.locationCache.has(weatherData) && !cacheEntryCorrect) {
            // In cache but need to update.
            this.locationCache.updateLocation(weatherData);
          } else if (!this.locationCache.has(weatherData)) {
            // Not in cache: add it in.
            this.locationCache.addLocation(weatherData);
          }
          // Return new WeatherLocationData object with only requested data as it is now udpated in cache.
          return this.getDataFromCache(getRainfall, getTemperature, location);
        })
        .catch((error) => {
          console.error(chalk.bgRed(`Error: retrieveWeatherDataLocation 
          MelbourneTimelapseWeatherClient.`));
          console.error(chalk.red(error.message));
          console.error(chalk.red(error.stack));
        });
    }
    return returnPromise;
  }

  /**
   * Retrieve weather data from SOAP client endpoint based on locations.
   */
  public retrieveWeatherLocationDataList(locations: string[]): Promise<WeatherLocationData[]> {
    const weatherPromises: Array<Promise<WeatherLocationData>> = [];
    // For each location, get temp and rainfall data.
    locations.forEach((location: string, locationIndex: number) => {
      // Force refresh of location cache as defaults forceRefresh to true.
      weatherPromises.push(this.retrieveWeatherLocationData(location));
    });
    return Promise.all(weatherPromises);
  } 
}

export { MelbourneTimelapseWeatherClient };
export default MelbourneTimelapseWeatherClient;
