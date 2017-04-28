import * as Soap from 'soap-as-promised';
import {WeatherLocationData, RainfallData, TemperatureData} from '../model/index';
import * as chalk from 'chalk';

interface RainfallRequestData {
  parameters: string;
}
interface TemperatureRequestData {
  parameters: string;
}
interface OnWeatherRetrievedListener {
  onWeatherRetrieved(weatherLocationDataList: Array<WeatherLocationData>);
}
interface OnLocationsRetrievedListener {
  onLocationsRetrieved(locations: Array<string>);
}
interface MelbourneWeatherServiceStub {
  // TODO: Maybe get rid of null?
  getLocations(locationRequestData: null): Promise<any>;
  getRainfall(rainfallRequestData: RainfallRequestData): Promise<any>;
  getTemperature(temperatureRequestData: TemperatureRequestData): Promise<any>;
}
/**
 * Creates a client, designed for the MelbourneWeatherApi.
 */
class MelbourneWeatherClient {
  weatherService: MelbourneWeatherServiceStub;
  onWeatherPollCompleteListeners: Array<OnWeatherRetrievedListener>;
  onLocationsPollCompleteListeners: Array<OnLocationsRetrievedListener>;
  constructor(melbourneWeatherSoapClient: MelbourneWeatherServiceStub) {
    this.weatherService = melbourneWeatherSoapClient;
    this.onWeatherPollCompleteListeners = [];
    this.onLocationsPollCompleteListeners = [];
  }
  addOnWeatherRetrievedListener(addedListener: OnWeatherRetrievedListener) {
    this.onWeatherPollCompleteListeners.push(addedListener);
  }
  removeOnWeatherRetrievedListener(removedListener: OnWeatherRetrievedListener) {
    this.onWeatherPollCompleteListeners.filter((listener) => {
      return listener !== removedListener;
    });
  }
  addOnLocationsRetrievedListener(addedListener: OnLocationsRetrievedListener) {
    this.onLocationsPollCompleteListeners.push(addedListener);
  }
  removeOnLocationsRetrievedListener(removedListener: OnLocationsRetrievedListener) {
    this.onLocationsPollCompleteListeners.filter((listener) => {
      return listener !== removedListener;
    });
  }
  retrieveLocations() {
    this.weatherService.getLocations(null)
    .then((locationsResponse) => {
      // locationsRespose is an object .return gives the data as an Array<string>
      // object.return
      let locations: Array<string> = locationsResponse.return;
      this.onLocationsPollCompleteListeners.forEach(
        (onLocationsPollCompleteListener: OnLocationsRetrievedListener) => {
          onLocationsPollCompleteListener.onLocationsRetrieved(locations);
        }
      );
    });
  }
  retrieveWeatherData(locations: Array<string>) {
    let weatherLocationDataList: Array<WeatherLocationData> = [];
    let weatherPromises: Array<Promise<any>> = [];
    locations.forEach((location: string) => {
      let temperatureData: TemperatureData;
      let rainfallData: RainfallData;
      
      //    var: Type: 
      const temperatureRequestPromise: Promise<any> = 
      // SOAP lib is async, .then to make sync.
      // TODO: is it meant to be parameters: location in the json.
        this.weatherService.getTemperature({parameters: location}).then((temperatureResponse) => {
          let temperatureStrings: Array<string> = temperatureResponse.return;
          temperatureData = new TemperatureData(temperatureStrings[0], temperatureStrings[1]);
        });
      const rainfallRequestPromise: Promise<any> = 
        this.weatherService.getRainfall({parameters: location})
        .then((rainfallResponse) => {
          let rainfallStrings: Array<string> = rainfallResponse.return;
          rainfallData = new RainfallData(rainfallStrings[0], rainfallStrings[1]);
        })
        .catch((error) => {
          console.log(chalk.red(error.message));
          console.log(chalk.red(error.stack));
        });

      let compileWeatherLocationDataPromises: Array<Promise<any>> = [temperatureRequestPromise, rainfallRequestPromise];
      // Promises are async and non blocking, .all() means to wait until promises resolved.
      Promise.all(compileWeatherLocationDataPromises)
      .then((responses) => {
        let weatherData: WeatherLocationData = new WeatherLocationData(location, rainfallData, temperatureData);
        weatherLocationDataList.push(weatherData);
      }).catch((error) => {
        console.log(chalk.red(error.message));
        console.log(chalk.red(error.stack));
      });
      // Wait for all promises before sending list.
      weatherPromises.push(rainfallRequestPromise);
      weatherPromises.push(temperatureRequestPromise);
    });
    // Update listeners.
    Promise.all(weatherPromises).then((responses) => {
      this.onWeatherPollCompleteListeners.forEach((onWeatherPollCompleteListener) => {
        onWeatherPollCompleteListener.onWeatherRetrieved(weatherLocationDataList);
      });
    }).catch((error) => {
      console.log(chalk.red(error.message));
      console.log(chalk.red(error.stack));
    });
  } 
}
// TODO: There are a lot of optional settings we can set in this builder
class Builder {
  build(): Promise<MelbourneWeatherClient> {
    return new Promise<MelbourneWeatherClient>((resolve, reject) => {
      Soap.createClient('http://viper.infotech.monash.edu.au:8180/axis2/services/MelbourneWeather2?wsdl')
      .then((weatherService: MelbourneWeatherServiceStub) => {
        let melbourneWeatherClient: MelbourneWeatherClient = new MelbourneWeatherClient(weatherService);
        resolve(melbourneWeatherClient);
      })
      .catch((error) => {
        console.log(chalk.red(error.message));
        console.log(chalk.red(error.stack));
        reject(error);
      });
    });
  }
}
export {Builder, MelbourneWeatherClient, OnWeatherRetrievedListener, OnLocationsRetrievedListener};
export default MelbourneWeatherClient;
