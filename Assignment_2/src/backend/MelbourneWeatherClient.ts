import * as chalk from 'chalk';

// tslint:disable-next-line:max-line-length
import { MelbourneWeatherServiceStub, OnLocationsRetrievedListener, OnWeatherRetrievedListener } from '../interface/Interfaces';
import { RainfallData, TemperatureData, WeatherLocationData } from '../model/Models';

// tslint:disable:no-console

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
   * @param addedListener 
   */
  public addOnWeatherRetrievedListener(addedListener: OnWeatherRetrievedListener) {
    this.onWeatherPollCompleteListeners.push(addedListener);
  }
  
  /**
   * Remove a listener from this.onWeatherPollCompleteListeners.
   * @param removedListener 
   */
  public removeOnWeatherRetrievedListener(removedListener: OnWeatherRetrievedListener) {
    this.onWeatherPollCompleteListeners.filter((listener) => {
      return listener !== removedListener;
    });
  }
  
  /**
   * Add a listener to this.onLocationsPollCompleteListeners which is triggered when 
   * retrieveLocations() is completed.
   * @param addedListener 
   */
  public addOnLocationsRetrievedListener(addedListener: OnLocationsRetrievedListener) {
    this.onLocationsPollCompleteListeners.push(addedListener);
  }
  
  public removeOnLocationsRetrievedListener(removedListener: OnLocationsRetrievedListener) {
    this.onLocationsPollCompleteListeners.filter((listener) => {
      return listener !== removedListener;
    });
  }
  
  /**
   * Retrieve locations from SOAP client endpoint.
   */
  public retrieveLocations() {
    this.weatherService.getLocations().then((locationsResponse) => {
      // locationsResponse is an object locationsResponse.return gives the data as an string.
      const locations: string[] = locationsResponse.return;
      this.onLocationsPollCompleteListeners.forEach(
        (onLocationsPollCompleteListener: OnLocationsRetrievedListener) => {
          onLocationsPollCompleteListener.onLocationsRetrieved(locations);
        }
      );
    });
  }
  
  public retrieveWeatherData(locations: string[]) {
    const weatherLocationDataList: WeatherLocationData[] = [];
    const weatherPromises: Array<Promise<any>> = [];
    locations.forEach((location: string) => {
      let temperatureData: TemperatureData;
      let rainfallData: RainfallData;
      
      //    var: Type: 
      const temperatureRequestPromise: Promise<any> = 
      // SOAP lib is async, .then to make sync.
      // TODO: is it meant to be parameters: location in the json.
        this.weatherService.getTemperature({parameters: location}).then((temperatureResponse) => {
          const temperatureStrings: string[] = temperatureResponse.return;
          temperatureData = new TemperatureData(temperatureStrings[0], temperatureStrings[1]);
        });
      const rainfallRequestPromise: Promise<any> = 
        this.weatherService.getRainfall({parameters: location})
        .then((rainfallResponse) => {
          const rainfallStrings: string[] = rainfallResponse.return;
          rainfallData = new RainfallData(rainfallStrings[0], rainfallStrings[1]);
        })
        .catch((error) => {
          console.log(chalk.red(error.message));
          console.log(chalk.red(error.stack));
        });

      const compileWeatherLocationDataPromises: Array<Promise<any>> = [temperatureRequestPromise, 
        rainfallRequestPromise];
      // Promises are async and non blocking, .all() means to wait until promises resolved.
      Promise.all(compileWeatherLocationDataPromises)
      .then((responses) => {
        const weatherData: WeatherLocationData = new WeatherLocationData(location, rainfallData, temperatureData);
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

export {MelbourneWeatherClient};
export default MelbourneWeatherClient;
