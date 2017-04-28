import { Builder, OnWeatherRetrievedListener, OnLocationsRetrievedListener } from './MelbourneWeatherClient';
import { WeatherLocationData } from '../model/index';
import * as SocketIo from 'socket.io';

console.log('~~~ Backend started ~~~');

// Setup web sockets.
var io = SocketIo.listen(8080); // Listen to port 8080 on backend (frontend --> send msg --> 8080).

io.sockets.on('connection', function(socket: SocketIO.Server) {  // Session started
  console.log('Session connection success');

  // Test socket connection from front end.
  socket.on('msg_from_front_end', function(msg: String) {
    console.log('Front end message: ' + msg);
  });

});

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
          setInterval(() => {melbourneWeatherClient.retrieveWeatherData(locations); }, 300000);  
        }
      }
    );
    melbourneWeatherClient.retrieveLocations();
  }
);
