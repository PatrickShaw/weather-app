import { Builder, OnWeatherRetrievedListener, OnLocationsRetrievedListener } from './MelbourneWeatherClient';
import { WeatherLocationData } from '../model/index';
import * as SocketIo from 'socket.io';

// Setup web sockets.
var io = SocketIo.listen(8080); // Listen to port 8080 on backend (frontend --> send msg --> 8080).

// Make SOAP Client.
new SoapClientBuilder().build()
.then((melbourneWeatherClient): void => {
    // When SOAP Client is resolved which returns melbourneWeatherClient from an async call.
    melbourneWeatherClient.addOnWeatherRetrievedListener(

new Builder()
.build()
.then(
  (melbourneWeatherClient) => {
    
    melbourneWeatherClient.addOnWeatherRetrievedListener(
      new class implements OnWeatherRetrievedListener {
        onWeatherRetrieved(weatherLocationDataList: Array<WeatherLocationData>) {
          // console.log(weatherLocationDataList);
          // Send updated data to front end.
          io.sockets.emit('update_weather_location_data', weatherLocationDataList);
        }
      }
    );
    
    melbourneWeatherClient.addOnLocationsRetrievedListener(
      new class implements OnLocationsRetrievedListener {
        onLocationsRetrieved(locations: Array<string>) {
          // console.log(locations);
          // Loop, a Js thing.
          // 300000 = 5 mins.
          // TODO: Fix so data populated once a session is connectecd.
          melbourneWeatherClient.retrieveWeatherData(locations); // Get weather data at time 0.
          // Note: setInterval() doesn't get data at time 0.
          setInterval(() => {melbourneWeatherClient.retrieveWeatherData(locations); }, 5000);  
        }
      }
    );
    melbourneWeatherClient.retrieveLocations();
  }
);
