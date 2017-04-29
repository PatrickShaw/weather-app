import * as SocketIo from 'socket.io';

import { OnLocationsRetrievedListener, OnWeatherRetrievedListener } from '../interface/Interfaces';

import { SoapClientBuilder } from './SoapClientBuilder';
import { WeatherLocationData } from '../model/Models';

// tslint:disable:no-console
// tslint:disable:max-classes-per-file

// Setup web sockets.
// Listen to port 8080, frontend connects to port 8080.
const io = SocketIo.listen(8080); 
io.sockets.on('connection', (socket) => {  // Session started with frontend.
  console.log('Session started');
});

new SoapClientBuilder().build().then((melbourneWeatherClient) => {

    melbourneWeatherClient.addOnWeatherRetrievedListener(
      new class implements OnWeatherRetrievedListener {
        
        /**
         * Anonymous class implements onWeatherRetrieved() method in OnWeatherRetrievedListener.
         * Logs timestamp and weatherLocationDataList in backend before sending data to frontend.
         * @param weatherLocationDataList 
         */
        public onWeatherRetrieved(weatherLocationDataList: WeatherLocationData[]) {
          // Send updated data to front end.
          const timeStamp: string = new Date().toString();
          console.log('Emit weather location data at time: ' + timeStamp);
          console.log(weatherLocationDataList);
          io.sockets.emit('update_weather_location_data', weatherLocationDataList);
        }
      }()
    );

    melbourneWeatherClient.addOnLocationsRetrievedListener(
      new class implements OnLocationsRetrievedListener {

        /**
         * 
         * @param locations 
         */
        public onLocationsRetrieved(locations: string[]) {
          console.log(locations);
          const msInterval = 5000;
          // setInterval() is a JavaScript method that runs the callback every 
          // msInterval milliseconds.
          // 300000 milliseconds = 5 mins.
          // TODO: Fix so data populated once a session is connectecd.
          melbourneWeatherClient.retrieveWeatherData(locations); // Get weather data at time 0.
          // Note: setInterval() doesn't get data at time 0.
          // TODO: Change 5000 to 5 mins in milliseconds.
          setInterval(() => {melbourneWeatherClient.retrieveWeatherData(locations); }, msInterval);  
        } 
      }()
    );
    melbourneWeatherClient.retrieveLocations();
  }
);
