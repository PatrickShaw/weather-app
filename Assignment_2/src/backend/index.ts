import * as SocketIo from 'socket.io';
import * as chalk from 'chalk';

import { OnLocationsRetrievedListener } from '../interface/OnLocationsRetrievedListener';
import { OnWeatherRetrievedListener } from '../interface/OnWeatherRetrievedListener';
import { SoapClientBuilder } from '../soap_weather_client/SoapClientBuilder';
import { WeatherLocationData } from '../model/WeatherLocationData';
import { MonitoringSessionManager } from '../monitor/MonitoringSessionManager';
import { MonitoringManager } from '../monitor/MonitoringManager';
import { MonitorMetadata } from '../model/MonitorMetadata';

let melbourneWeatherLocations: string[] = [];
const sessionManager: MonitoringSessionManager = new MonitoringSessionManager();
// Setup web sockets.
// Listen to port 8080, frontend connects to port 8080.
const io: SocketIO.Server = SocketIo.listen(8080); 
io.sockets.on('connection', (socket: SocketIO.Socket): void => {  
  // Session started with frontend.
  const sessionId: string = socket.id;
  console.log(`Session started ${sessionId}`);
  sessionManager.addMonitoringSession(sessionId, new MonitoringManager());
  if (melbourneWeatherLocations.length > 0) {
    socket.emit('locations', melbourneWeatherLocations);
  }

  socket.on('add_monitor', (monitor: MonitorMetadata) => {
    console.log(`Session ID ${chalk.magenta(sessionId)} added monitor ${chalk.magenta(monitor.location)}`);
    const monitoringSession: MonitoringManager | undefined = sessionManager.getMonitoringSession(sessionId);
    if (monitoringSession) {
      monitoringSession.addMonitorLocation(monitor);
      socket.emit('monitored_locations', Array.from(monitoringSession.getMonitoredLocations()));
      socket.emit('add_weather_data', );
      console.log('emitted:');
      console.log(monitoringSession.getMonitoredLocations());
    } else {
      console.error(`${chalk.red('Could add monitor. No session for ID: ')}${chalk.magenta(sessionId)}`);
    }
  });

  socket.on('remove_monitor', (monitor: MonitorMetadata) => {
    console.log(`Session ID ${chalk.magenta(sessionId)} removed monitor ${chalk.magenta(monitor.location)}`);
    const monitoringSession: MonitoringManager | undefined = sessionManager.getMonitoringSession(sessionId);
    if (monitoringSession) {
      monitoringSession.removeMonitoredLocation(monitor);
      socket.emit('monitored_locations', Array.from(monitoringSession.getMonitoredLocations()));
    } else {
      console.error(`${chalk.red('Could remove monitor. No session for ID: ')}${chalk.magenta(sessionId)}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Session ended: ${sessionId}`);
    sessionManager.removeMonitoringSession(sessionId);
  });
});

// Make SOAP Client.
new SoapClientBuilder().build()
.then((melbourneWeatherClient): void => {
  // When SOAP Client is resolved which returns melbourneWeatherClient from an async call.
  melbourneWeatherClient.addOnWeatherRetrievedListener(
      new class implements OnWeatherRetrievedListener {        
        public onWeatherRetrieved(weatherLocationDataList: WeatherLocationData[]): void {
          // Logs timestamp and weatherLocationDataList in backend before sending data to frontend.
          // Send updated data to front end.
          const timeStamp: string = new Date().toString();
          console.log(`${chalk.green('Retrieved weather data at time: ')}${timeStamp}`);
          console.log(weatherLocationDataList);
          for (const sessionId of Object.keys(io.sockets.sockets)) {
            try {
              console.info(`Getting monitoring session for session ID: ${chalk.magenta(sessionId)}`);
              const monitoringSession: MonitoringManager | undefined = sessionManager.getMonitoringSession(sessionId);
              if (monitoringSession) {
                const locationsToEmitWeatherFor: Set<string> = monitoringSession.getMonitoredLocations();
                for (const R of locationsToEmitWeatherFor) {
                  console.log(`SWEK ${R}`);
                }
                // We only need to emit data if the user is monitoring a location.
                // Otherwise don't even bother executing the emission code.
                if (locationsToEmitWeatherFor.size > 0) {
                  const weatherDataToEmit: WeatherLocationData[] = [];
                  for (const weatherData of weatherLocationDataList) {
                    if (locationsToEmitWeatherFor.has(weatherData.location)) {
                      weatherDataToEmit.push(weatherData);
                    } else {
                      console.log(`Not in: ${weatherData.location}`);
                    }
                  }
                  const socket = io.sockets.sockets[sessionId];
                  socket.emit('replace_weather_data', weatherDataToEmit);
                } else {
                  console.log(
                    `Session ID ${chalk.magenta(sessionId)} wasn't monitoring anything, skipping emission.`
                  );
                }
              } else {
                console.error(
                  chalk.red(`Socket ${chalk.magenta(sessionId)} had no monitoring session. Skipping emit.`)
                );
              }
            } catch (error) {
              console.error(chalk.bgRed(error.message));
              console.error(chalk.red(error.stack));
            }
          }
        }
      }()
    );

  melbourneWeatherClient.addOnLocationsRetrievedListener(
    new class implements OnLocationsRetrievedListener {
      public onLocationsRetrieved(locations: string[]): void {
        // Retrieves all locations from SOAP client points.
        // Only called once, under the assumption locations are set.
        melbourneWeatherLocations = locations.sort();
        io.sockets.emit('locations', locations);
        console.log(chalk.cyan(`locations: ${locations}`));
        const msInterval = 30000;
        // setInterval() is a JavaScript method that runs the method every msInterval milliseconds.
        // 300000 milliseconds = 5 mins.
        // TODO: Fix so data populated once a session is connected, cache it.
        // TODO: Change 5000 to 5 mins in milliseconds.
        // Note: setInterval() doesn't get data at time 0.        
        melbourneWeatherClient.retrieveWeatherData(sessionManager.getMonitoredLocations());
        setInterval((): void => { 
          melbourneWeatherClient.retrieveWeatherData(sessionManager.getMonitoredLocations()); 
        }, msInterval);  
      }
    }()
  );
  melbourneWeatherClient.retrieveLocations();
})
.catch((error) => {
  console.error(chalk.bgRed('Error: SOAP client connection'));
  console.error(chalk.red(error.message));
  console.error(chalk.red(error.stack));
});
