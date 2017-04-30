import * as chalk from 'chalk';

import { MonitorMetadata } from '../model/MonitorMetadata';
import { MonitoringManager } from '../monitor/MonitoringManager';
import { MonitoringSessionManager } from '../monitor/MonitoringSessionManager';
import { OnLocationsRetrievedListener } from '../interface/OnLocationsRetrievedListener';
import { OnWeatherRetrievedListener } from '../interface/OnWeatherRetrievedListener';
import { SoapClientBuilder } from '../soap_weather_client/MelbourneWeatherClientBuilder';
import { WeatherLocationData } from '../model/WeatherLocationData';

/**
 * Controller class instantiated by the node server.
 */
class FullLambdaService {
  private sessionManager: MonitoringSessionManager = new MonitoringSessionManager();
  // Convention to call SocketIO.Server io.
  private io: SocketIO.Server;
  // All locations retrieved from SOAP client.
  private melbourneWeatherLocations: string[] = [];

  constructor(io: SocketIO.Server) {
    // Set up socketIoServer connections.
    this.io = io;
    this.initialiseSocketEndpoints();
  }
    
  private initialiseSocketEndpoints(): void {
    this.io.sockets.on('connection', (socket: SocketIO.Socket): void => {  
      // Called when session started with frontend.
      const sessionId: string = socket.id;
      console.log(`Session started ${sessionId}`);
      // Add MonitoringManager to manage session with front end client.
      this.sessionManager.addMonitoringSession(sessionId, new MonitoringManager());
      if (this.melbourneWeatherLocations.length > 0) {
        // Send off locations from SOAP client.
        socket.emit('locations', this.melbourneWeatherLocations);
      }

      try {
        socket.on('add_monitor', (monitor: MonitorMetadata) => {
          // Frontend emitted add_monitor with MonitorMetadata.
          console.log(`Session ID ${chalk.magenta(sessionId)} added monitor ${chalk.magenta(monitor.location)}`);
          const monitoringSession: MonitoringManager | undefined = this.sessionManager.getMonitoringSession(sessionId);
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
      } catch (error) {
        const errorMessage: string = `Error: socket.on \'add_monitor\' ${error}`;
        console.log(chalk.red(errorMessage));
        socket.emit('errors_messages', errorMessage);
      }
      
      try {
        socket.on('remove_monitor', (monitor: MonitorMetadata) => {
          console.log(`Session ID ${chalk.magenta(sessionId)} removed monitor ${chalk.magenta(monitor.location)}`);
          const monitoringSession: MonitoringManager | undefined = this.sessionManager.getMonitoringSession(sessionId);
          if (monitoringSession) {
            monitoringSession.removeMonitoredLocation(monitor);
            socket.emit('monitored_locations', Array.from(monitoringSession.getMonitoredLocations()));
          } else {
            console.error(`${chalk.red('Could remove monitor. No session for ID: ')}${chalk.magenta(sessionId)}`);
          }
        });
      } catch (error) {
        const errorMessage: string = `Error: socket.on \'remove_monitor\' ${error}`;
        console.log(chalk.red(errorMessage));
        socket.emit('errors_messages', errorMessage);
      }
     

      socket.on('disconnect', () => {
        console.log(`Session ended: ${sessionId}`);
        this.sessionManager.removeMonitoringSession(sessionId);
      });
    });
  }

  public run(): void {
    // Make SOAP Client.
    const that = this;
    new SoapClientBuilder().build()
    .then((melbourneWeatherClient): void => {
      // TODO: emit good.
      // When SOAP Client is resolved which returns melbourneWeatherClient from an async call.
      melbourneWeatherClient.addOnWeatherRetrievedListener(
          new class implements OnWeatherRetrievedListener {        
            public onWeatherRetrieved(weatherLocationDataList: WeatherLocationData[]): void {
              // Logs timestamp and weatherLocationDataList in backend before sending data to frontend.
              // Send updated data to front end.
              const timeStamp: string = new Date().toString();
              console.log(`${chalk.green('Retrieved weather data at time: ')}${timeStamp}`);
              console.log(weatherLocationDataList);
              for (const sessionId of Object.keys(that.io.sockets.sockets)) {
                try {
                  console.info(`Getting monitoring session for session ID: ${chalk.magenta(sessionId)}`);
                  const monitoringSession: MonitoringManager | undefined = 
                  that.sessionManager.getMonitoringSession(sessionId);
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
                      const socket = that.io.sockets.sockets[sessionId];
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
            that.melbourneWeatherLocations = locations.sort();
            that.io.sockets.emit('locations', locations);
            console.log(chalk.cyan(`locations: ${locations}`));
            const msInterval = 30000;
            // setInterval() is a JavaScript method that runs the method every msInterval milliseconds.
            // 300000 milliseconds = 5 mins.
            // TODO: Fix so data populated once a session is connected, cache it.
            // TODO: Change 5000 to 5 mins in milliseconds.
            // Note: setInterval() doesn't get data at time 0.        
            melbourneWeatherClient.retrieveWeatherData(that.sessionManager.getMonitoredLocations());
            setInterval((): void => { 
              melbourneWeatherClient.retrieveWeatherData(that.sessionManager.getMonitoredLocations()); 
            }, msInterval);  
          }
        }()
      );
      melbourneWeatherClient.retrieveLocations();
    })
    .catch((error) => {
      // TODO: emit bad.
      console.error(chalk.bgRed('Error: SOAP client connection'));
      console.error(chalk.red(error.message));
      console.error(chalk.red(error.stack));
    });

  }

}
export {FullLambdaService};
export default FullLambdaService;
