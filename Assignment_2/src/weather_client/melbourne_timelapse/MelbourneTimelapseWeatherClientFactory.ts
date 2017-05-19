import * as Soap from 'soap-as-promised';
import * as chalk from 'chalk';

import { MelbourneTimelapseWeatherClient } from './MelbourneTimelapseWeatherClient';
import { MelbourneTimelapseWeatherSoapServiceStub } from './MelbourneTimelapseWeatherSoapServiceStub';
import { WeatherClientFactory } from '../WeatherClientFactory';

/**
 * Builds an async SOAP Client from the provided wsdl file.
 */
class MelbourneTimelapseWeatherClientFactory implements WeatherClientFactory<MelbourneTimelapseWeatherClient> {
  private wdslUrl: string;
  constructor(
    wdslUrl: string = 'http://viper.infotech.monash.edu.au:8180/axis2/services/MelbourneWeatherTimeLapse?wsdl'
  ) {
    this.wdslUrl = wdslUrl;
  }

  public createWeatherClient(): Promise<MelbourneTimelapseWeatherClient> {
    return new Promise<MelbourneTimelapseWeatherClient>((resolve, reject) => {
      Soap.createClient(this.wdslUrl)
        .then((weatherService: MelbourneTimelapseWeatherSoapServiceStub) => {
          // weatherService has methods defined in MelbourneWeatherServiceStub.
          const melbourneWeatherClient: MelbourneTimelapseWeatherClient 
            = new MelbourneTimelapseWeatherClient(weatherService);
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

export {MelbourneTimelapseWeatherClientFactory};
export default MelbourneTimelapseWeatherClientFactory;
