import { WeatherLocationData } from '../model/index';
import { Builder, OnLocationsRetrievedListener, OnWeatherRetrievedListener } from './MelbourneWeatherClient';
new Builder()
.build()
.then(
  (melbourneWeatherClient) => {
    melbourneWeatherClient.addOnWeatherRetrievedListener(
      new class() implements OnWeatherRetrievedListener {
        onWeatherRetrieved(weatherLocationDataList: WeatherLocationData[]) {
        // tslint:disable-next-line:no-console
        console.log('WHAT THE FUCK');
        // console .log(weatherLocationDataList);
        }
      }
    );
    melbourneWeatherClient.addOnLocationsRetrievedListener(
      new class implements OnLocationsRetrievedListener {
        onLocationsRetrieved(locations: Array<string>) {
        console.log('WHAT THE FUCK LOCATIONS');

        // console.log(locations);
          // Does calls.
        setInterval(() => { melbourneWeatherClient.retrieveWeatherData(locations); }, 5000);
        }
      }
    );
    melbourneWeatherClient.retrieveLocations();
  }
);
