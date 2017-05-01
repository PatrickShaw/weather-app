import * as chalk from 'chalk';

import { LocationCache } from './LocationCache';
import { LocationMonitoringManager } from '../monitor/LocationMonitoringManager';
import { MonitorMetadata } from '../model/MonitorMetadata';
import { RequestError } from '../model/RequestError';
import { RequestResponse } from '../model/RequestResponse';
import { SessionMonitoringManager } from '../monitor/SessionMonitoringManager';
import { WeatherClient } from '../weather_client/WeatherClient';
import { WeatherClientFactory } from '../weather_client/WeatherClientFactory';
import { WeatherLocationData } from '../model/WeatherLocationData';
import SocketKeys from '../socket.io/socket-keys';

// TODO: Consider if having soft dependencies on Temp & Rainfall & their request data types is better
// allows for dependency injection where you pass in req parameters.

/**
 * Controller class instantiated by the node server.
 */
class FullLambdaService {
  private readonly weatherClientFactory: WeatherClientFactory<WeatherClient>;
  private readonly sessionManager: SessionMonitoringManager;
  // Convention to call SocketIO.Server io.
  private readonly io: SocketIO.Server;
  // All locations retrieved from SOAP client.
  private melbourneWeatherLocations: string[] = [];
  private succesfulSoapClientconnection: boolean;
  private locationCache: LocationCache;
  private weatherClient: WeatherClient;

  constructor(
    io: SocketIO.Server, 
    weatherClientFactory: WeatherClientFactory<WeatherClient>,
    sessionManager: SessionMonitoringManager = new SessionMonitoringManager()
  ) {
    this.locationCache = new LocationCache();
    this.succesfulSoapClientconnection = false;
    this.melbourneWeatherLocations = [];
    this.sessionManager = sessionManager;
    this.io = io;
    this.weatherClientFactory = weatherClientFactory;
  }
  
  /**
   * Setup websocket endpoints using SocketIO.
   */
  private initialiseSocketEndpoints(): void {
    this.io.sockets.on('connection', (socket: SocketIO.Socket): void => {  
      // Called when session started with frontend.
      const sessionId: string = socket.id;
      console.log(`Session started ${sessionId}`);
      // Add MonitoringManager to manage session with front end client.
      this.sessionManager.addMonitoringSession(sessionId, new LocationMonitoringManager());
      if (this.melbourneWeatherLocations.length > 0) {
        // Send off locations from SOAP client.
        socket.emit(SocketKeys.retrievedLocations, this.melbourneWeatherLocations);
      }

      socket.on(SocketKeys.addMonitor, (monitor: MonitorMetadata) => {
        try {
          // Frontend sessions wants to monitor another location.
          // monitor is a string that is a location.
          const locationMonitoringManager: LocationMonitoringManager | undefined = 
          this.sessionManager.getLocationMonitorManagerForSession(sessionId);
          if (locationMonitoringManager) {
            console.log(`Session ID ${chalk.magenta(sessionId)} added monitor ${chalk.magenta(monitor.location)}`);
            // Can add monitor.
            // Add new location to monitor to all locations that are monitored.
            locationMonitoringManager.addMonitorLocation(monitor);
            if (this.locationCache.has(monitor.location)) {
              socket.emit(SocketKeys.addMonitor, new RequestResponse(this.locationCache.get(monitor.location), null));
            } else {
              this.weatherClient.retrieveWeatherLocationData(monitor.location, true, true)
                .then((weatherLocationData) => {
                  socket.emit(SocketKeys.addMonitor, new RequestResponse(weatherLocationData, null));
                }).catch((error) => {
                  console.log(chalk.red(error.message));
                  console.log(chalk.red(error.stack));
                });
            }
          } else {
            // Can't add monitor.
            console.error(`${chalk.red('Could add monitor. No session for ID: ')}${chalk.magenta(sessionId)}`);
            const requestError = new RequestError(`Could add monitor ${monitor}.`, `No session for ID: ' ${sessionId}`);
            const response = new RequestResponse(null, requestError);
            socket.emit(SocketKeys.addMonitor, response);
          }
        } catch (error) {
          const requestError = new RequestError(`Failed to add monitor for location ${monitor}`, error.message);
          const response = new RequestResponse(null, requestError);
          console.error(chalk.red(error.message));
          console.error(chalk.red(error.stack));
          socket.emit(SocketKeys.addMonitor, response);
        }
      });
         
      socket.on(SocketKeys.removeMonitor, (monitor: MonitorMetadata) => {
        // monitor is a string that is a location.
        // Frontend emitted remove_monitor with MonitorMetadata.
        try {
          // Note: | means can be type_a or type_b where type_a | type_b.
          const locationMonitoringManager: LocationMonitoringManager | undefined = 
          this.sessionManager.getLocationMonitorManagerForSession(sessionId);
          if (locationMonitoringManager) {
            console.log(`Session ID ${chalk.magenta(sessionId)} removed monitor ${chalk.magenta(monitor.location)}`);
            // Can remove location.
            locationMonitoringManager.removeMonitoredLocation(monitor);
            socket.emit(SocketKeys.removeMonitor, new RequestResponse(monitor, null));
          } else {
            // Can't remove location.
            console.error(`${chalk.red('Could remove monitor. No session for ID: ')}${chalk.magenta(sessionId)}`);
            const requestError = new RequestError(
              `Could remove monitor ${monitor}.`,
              `No session for ID: ' ${sessionId}`
            );
            const response = new RequestResponse(null, requestError);
            socket.emit(SocketKeys.removeMonitor, response);
          }
        } catch (error) {
          const requestError = new RequestError(
            `Failed to remove monitor for location ${monitor}`, 
            error.message
          );
          const response = new RequestResponse(null, requestError);
          console.log(chalk.red(error.message));
          console.log(chalk.red(error.stack));
          socket.emit(SocketKeys.removeMonitor, response);
        }
      });

      socket.on('disconnect', () => {
        console.log(`Session ended: ${sessionId}`);
        this.sessionManager.removeMonitoringSession(sessionId);
      });

      // Emit to front end whether the SOAP Client was successfully created.
      this.io.emit(SocketKeys.soapClientCreationSuccess, this.succesfulSoapClientconnection);
    });
  }


  private onAllLocationsRetrieved(locations: string[]) {
    // Retrieves all locations from SOAP client points.
    // Only called once, under the assumption locations are set.
    this.melbourneWeatherLocations = locations;
    this.melbourneWeatherLocations.sort();
    // Send locations to front end.
    this.io.sockets.emit(SocketKeys.retrievedLocations, locations);
    console.log(chalk.cyan(`locations: ${locations}`));
    // setInterval() is a JavaScript method that runs the method every msInterval milliseconds.
    // 300000 milliseconds = 5 mins.
    const msInterval = 5000;
    // TODO: Fix so data populated once a session is connected, cache it.
    // Note: setInterval() doesn't get data at time 0.
    this.retrieveAllMonitoredWeatherData();
    setInterval((): void => { this.retrieveAllMonitoredWeatherData(); }, msInterval );  
  }

  private onWeatherLocationDataRetrieved(weatherLocationDataList: WeatherLocationData[]) {
    console.log(weatherLocationDataList);
    // Logs timestamp and weatherLocationDataList in backend before sending data to frontend.
    // Send updated data to front end.
    const timeStamp: string = new Date().toString();
    console.log(`${chalk.green('Retrieved weather data at time: ')}${timeStamp}`);
    for (const weatherData of weatherLocationDataList) {
      this.locationCache.setLocation(weatherData.location, weatherData);
    }
    // Note: sockets.sockets is a Socket IO library attribute.
    for (const sessionId of Object.keys(this.io.sockets.sockets)) {
      try {
        console.info(`Getting monitoring session for session ID: ${chalk.magenta(sessionId)}`);
        const monitoringSession: LocationMonitoringManager | undefined = 
        this.sessionManager.getLocationMonitorManagerForSession(sessionId);
        if (monitoringSession) {
          const locationsToEmitWeatherFor: Set<string> = monitoringSession.getMonitoredLocations();
          // We only need to emit data if the user is monitoring a location.
          // Otherwise don't even bother executing the emission code.
          if (locationsToEmitWeatherFor.size > 0) {
            const weatherDataToEmit: WeatherLocationData[] = [];
            for (const weatherData of weatherLocationDataList) {
              if (locationsToEmitWeatherFor.has(weatherData.location)) {
                weatherDataToEmit.push(weatherData);
              }
            }
            const socket = this.io.sockets.sockets[sessionId];
            socket.emit(SocketKeys.replaceWeatherData, weatherDataToEmit);
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

  private retrieveAllMonitoredWeatherData(): void {
    this.weatherClient.retrieveWeatherLocationDataList(this.sessionManager.getMonitoredLocations())
      .then((weatherLocationDataList) => {
        this.onWeatherLocationDataRetrieved(weatherLocationDataList);
      }).catch((error) => {
        console.log(chalk.red(error));
        console.log(chalk.red(error.stack));
      });
  }

  /**
   * Runs main loop for the full lambda service via setInterval.
   */
  public run(): void {
    this.initialiseSocketEndpoints();
    // Make MelbourneWeatherClient that has a SOAP Client.
    this.weatherClientFactory.createWeatherClient()
      .then((weatherClient: WeatherClient): void => {
        this.weatherClient = weatherClient;
        console.log(chalk.green('SOAP Client created'));
        // When SOAP Client is resolved which returns melbourneWeatherClient from an async call.
        this.succesfulSoapClientconnection = true;
        this.io.emit(SocketKeys.soapClientCreationSuccess, this.succesfulSoapClientconnection);
        // Get locations from SOAP client in melbourneWeatherClient.
        weatherClient.retrieveLocations().then((locations: string[]) => {
          this.onAllLocationsRetrieved(locations);
        });
      })
      .catch((error) => {
        console.error(chalk.bgRed('Failed to create SOAP client connection'));
        console.error(chalk.red(error.message));
        console.error(chalk.red(error.stack));
      });
  }
}

export {FullLambdaService};
export default FullLambdaService;
