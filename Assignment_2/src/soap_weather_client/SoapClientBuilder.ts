import * as Soap from 'soap-as-promised';
import * as chalk from 'chalk';

import { MelbourneWeatherClient } from './MelbourneWeatherClient';
import { MelbourneWeatherServiceStub } from '../interface/Interfaces';

// TODO: There are a lot of optional settings we can set in this builder.

/**
 * Builds an async SOAP Client from the provided wsdl file.
 */
class SoapClientBuilder {
  public build(): Promise<MelbourneWeatherClient> {
    return new Promise<MelbourneWeatherClient>((resolve, reject) => {
      Soap.createClient('http://viper.infotech.monash.edu.au:8180/axis2/services/MelbourneWeather2?wsdl')
      .then((weatherService: MelbourneWeatherServiceStub) => {
        // weatherService has methods defined in MelbourneWeatherServiceStub.
        const melbourneWeatherClient: MelbourneWeatherClient = new MelbourneWeatherClient(weatherService);
        resolve(melbourneWeatherClient);
      })
      .catch((error) => {
        console.log(chalk.bgRed('Error: SOAP client connection'));
        console.log(chalk.red(error.message));
        console.log(chalk.red(error.stack));
        reject(error);
      });
    });
  }
}

export {SoapClientBuilder};
export default SoapClientBuilder;
