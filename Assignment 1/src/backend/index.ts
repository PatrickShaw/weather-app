import { Builder, OnWeatherRetrievedListener, OnLocationsRetrievedListener } from './MelbourneWeatherClient';
import { WeatherLocationData } from '../model/index';
new Builder()
.build()
.then(
  (melbourneWeatherClient) => {
    melbourneWeatherClient.addOnWeatherRetrievedListener(
      new class implements OnWeatherRetrievedListener {
        onWeatherRetrieved(weatherLocationDataList: Array<WeatherLocationData>) {
          console .log(weatherLocationDataList);
        }
      }
    );
    melbourneWeatherClient.addOnLocationsRetrievedListener(
      new class implements OnLocationsRetrievedListener {
        onLocationsRetrieved(locations: Array<string>) {
          console.log(locations);
          setInterval(() => { melbourneWeatherClient.retrieveWeatherData(locations); }, 5000);
        }
      }
    );
    melbourneWeatherClient.retrieveLocations();
  }
);
