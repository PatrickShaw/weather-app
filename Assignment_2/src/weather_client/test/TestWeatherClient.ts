import { WeatherClient } from '../WeatherClient';
import { WeatherLocationData } from '../../model/WeatherLocationData';
import { RainfallData } from '../../model/RainfallData';
import { TemperatureData } from '../../model/TemperatureData';
import { RainfallRequestData } from '../../model/RainfallRequestData';
import { TemperatureRequestData } from '../../model/TemperatureRequestData';

/**
 * Sometimes the SOAP API is down so we needed to create an extra client so that we could use offline dummy data 
 * while we wait for the SOAP API to turn on again.
 * On top of that we also have needed to run tests independant of the SOAP client.
 */
class TestWeatherClient implements WeatherClient {
  private createDummyRainfallData(rainfallRequestData: RainfallRequestData): RainfallData {
    return new RainfallData(
      `Rainfall ${rainfallRequestData.parameters}`,
      `Rainfall timestamp ${new Date().toString()}`
    );
  }

  private createDummyTemperatureData(temperatureRequestData: TemperatureRequestData): TemperatureData {
    return new TemperatureData(
      `Temperature ${temperatureRequestData.parameters}`,
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
    getRainfall: boolean, 
    getTemperature: boolean
  ): Promise<WeatherLocationData> {
    return new Promise<WeatherLocationData>((resolve, reject) => {
      resolve(new WeatherLocationData(
          location,
          this.createDummyRainfallData(new RainfallRequestData(location)),
          this.createDummyTemperatureData(new TemperatureRequestData(location))
      ));
    });
  }

  public retrieveWeatherLocationDataList(locations: string[]): Promise<WeatherLocationData[]> {
    return new Promise<WeatherLocationData[]>((resolve, reject) => {
      const dummyLocationData: WeatherLocationData[] = [];
      for (const location of locations) {
        dummyLocationData.push(new WeatherLocationData(
          location,
          this.createDummyRainfallData(new RainfallRequestData(location)),
          this.createDummyTemperatureData(new TemperatureRequestData(location))
        ));
      }
      resolve(dummyLocationData);
    });
  }
}
export { TestWeatherClient };
export default TestWeatherClient;
