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
    return this.weatherService.getWeather(new SoapRequest<string>(location))
        .then((response: SoapResponse<string[]>) => {
          const data: string[] = response.return;
          const timestamp: string = data[0];
          const rainfall: string = data[2];
          let temperature: string = data[1];
          const tempCelsius: number = +temperature  - 273.15;
          temperature = '' + tempCelsius;  // Converted to celsius.
          return new WeatherLocationData(
            location, 
            new RainfallData(rainfall, timestamp), 
            new TemperatureData(temperature, timestamp)
          );
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
