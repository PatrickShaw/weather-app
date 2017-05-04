import * as Soap from 'soap-as-promised';
import * as chalk from 'chalk';

import { MelbourneWeatherClient } from './MelbourneWeatherClient';
import { MelbourneWeatherSoapServiceStub } from './MelbourneWeatherSoapServiceStub';
import { WeatherClientFactory } from '../WeatherClientFactory';

/**
 * Builds an async SOAP Client from the provided wsdl file.
 */
class MelbourneWeatherClientFactory implements WeatherClientFactory<MelbourneWeatherClient> {
  private wdslUrl: string;
  constructor(
    wdslUrl: string = 'http://viper.infotech.monash.edu.au:8180/axis2/services/MelbourneWeather2?wsdl'
  ) {
    this.wdslUrl = wdslUrl;
  }

  public createWeatherClient(): Promise<MelbourneWeatherClient> {
    return new Promise<MelbourneWeatherClient>((resolve, reject) => {
      Soap.createClient(this.wdslUrl)
        .then((weatherService: MelbourneWeatherSoapServiceStub) => {
          // weatherService has methods defined in MelbourneWeatherServiceStub.
          const melbourneWeatherClient: MelbourneWeatherClient = new MelbourneWeatherClient(weatherService);
          console.log(chalk.cyan('SOAP Client created'));
          resolve(melbourneWeatherClient);
        })
        .catch((error) => {
          console.log(chalk.bgRed('Could not make SOAP Client'));
          reject(error);
        });
    });
  }
}

export {MelbourneWeatherClientFactory};
export default MelbourneWeatherClientFactory;
