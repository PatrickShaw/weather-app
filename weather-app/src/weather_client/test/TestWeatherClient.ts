import { RainfallData } from '../../model/RainfallData';
import { TemperatureData } from '../../model/TemperatureData';
import { WeatherClient } from '../WeatherClient';
import { WeatherLocationData } from '../../model/WeatherLocationData';

/**
 * Sometimes the SOAP API is down so we needed to create an extra client so that we could use offline dummy data 
 * while we wait for the SOAP API to turn on again.
 * On top of that we also have needed to run tests independant of the SOAP client.
 */
class TestWeatherClient implements WeatherClient {
  private pollCount: number = 0;
  constructor() {
    setInterval(
      () => {
        this.pollCount += 1;
      }, 
      50
    );
  }
  protected createDummyRainfallData(location: string, forceRefresh: boolean): RainfallData {
    return new RainfallData(
      `Rainfall ${location}, ${this.pollCount} (Forced refresh: ${forceRefresh})`,
      `Rainfall timestamp ${new Date().toString()}`
    );
  }

  protected createDummyTemperatureData(location: string, forceRefresh: boolean): TemperatureData {
    return new TemperatureData(
      `Temperature ${location}, ${this.pollCount} (Forced refresh: ${forceRefresh})`,
      `Temperature timestamp ${new Date().toString()}`
    );
  }

  public retrieveLocations(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const dummyLocations: string[] = [];
      for (let l = 0; l < 15; l++) {
        dummyLocations.push(`Location ${l}`);
      }
      resolve(dummyLocations);
    });
  }

  public retrieveWeatherLocationData(
    location: string, 
    getRainfall: boolean = true, 
    getTemperature: boolean = true,
    forceRefresh: boolean = true
  ): Promise<WeatherLocationData> {
    return new Promise<WeatherLocationData>((resolve, reject) => {
      resolve(new WeatherLocationData(
          location,
          getRainfall ? this.createDummyRainfallData(location, forceRefresh) : null,
          getTemperature ? this.createDummyTemperatureData(location, forceRefresh) : null
      ));
    });
  }

  public retrieveWeatherLocationDataList(locations: string[]): Promise<WeatherLocationData[]> {
    return new Promise<WeatherLocationData[]>((resolve, reject) => {
      const weatherPromises: Array<Promise<WeatherLocationData>> = [] ;
      for (const location of locations) {
        weatherPromises.push(this.retrieveWeatherLocationData(location));
      }
      resolve(Promise.all(weatherPromises));
    });
  }
}
export { TestWeatherClient };
export default TestWeatherClient;
