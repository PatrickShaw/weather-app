import * as chalk from 'chalk';

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

// 300000 milliseconds = 5 mins.
const defaultWeatherPollingInterval: number = 5000;
// const defaultSoapClientCreationRetries: number = 20;
// const defaultSoapClientRetryInterval: number = 30000;

/**
 * Controller class instantiated by the node server.
 */
class FullLambdaService {
  private readonly weatherClientFactory: WeatherClientFactory<WeatherClient>;
  private readonly rainfallSessionManager: SessionMonitoringManager;
  private readonly temperatureSessionManager: SessionMonitoringManager;
  // Convention to call SocketIO.Server io.
  private readonly io: SocketIO.Server;
  // All locations retrieved from SOAP client.
  private melbourneWeatherLocations: string[] = [];
  private succesfulSoapClientconnection: boolean;
  private weatherClient: WeatherClient;

  constructor(
    io: SocketIO.Server, 
    weatherClientFactory: WeatherClientFactory<WeatherClient>,
    sessionManager: SessionMonitoringManager = new SessionMonitoringManager(),
    rainfallSessionManager: SessionMonitoringManager = new SessionMonitoringManager(),
    temperatureSessionManager: SessionMonitoringManager = new SessionMonitoringManager()
  ) {
    this.succesfulSoapClientconnection = false;
    this.melbourneWeatherLocations = [];
    this.rainfallSessionManager = sessionManager;
    this.io = io;
    this.weatherClientFactory = weatherClientFactory;
    this.temperatureSessionManager = temperatureSessionManager;
  }
  
  /**
   * Setup websocket endpoints using SocketIO.
   */
  private initialiseSocketEndpoints(): void {
    this.io.sockets.on('connection', (socket: SocketIO.Socket): void => {  
      // Called when session started with frontend.
      const sessionId: string = socket.id;
      console.log(`Session started ${sessionId}`);
      this.io.emit(SocketKeys.retrievedLocations, this.melbourneWeatherLocations);
      // Add MonitoringManager to manage session with front end client.
      this.rainfallSessionManager.addMonitoringSession(sessionId, new LocationMonitoringManager());
      this.temperatureSessionManager.addMonitoringSession(sessionId, new LocationMonitoringManager());
      this.initialiseMonitorSocketEvent(
        socket,
        SocketKeys.addRainfallMonitor, 
        SocketKeys.removeRainfallMonitor, 
        this.rainfallSessionManager
      );

      this.initialiseMonitorSocketEvent(
        socket,
        SocketKeys.addTemperatureMonitor,
        SocketKeys.removeTemperatureMonitor,
        this.temperatureSessionManager
      );

      socket.on('disconnect', () => {
        console.log(`Session ended: ${sessionId}`);
        this.rainfallSessionManager.removeMonitoringSession(sessionId);
        this.temperatureSessionManager.removeMonitoringSession(sessionId);
      });

      // Emit to front end whether the SOAP Client was successfully created.
      this.io.emit(SocketKeys.soapClientCreationSuccess, this.succesfulSoapClientconnection);
    });
  }

  private initialiseMonitorSocketEvent(
    socket: SocketIO.Socket,
    addEventName: string, 
    removeEventName: string,
    sessionManager: SessionMonitoringManager
  ) {
    const sessionId = socket.id;
    socket.on(addEventName, (monitor: MonitorMetadata) => {
      try {
        // Frontend sessions wants to monitor another location.
        // monitor is a string that is a location.
        const locationMonitoringManager: LocationMonitoringManager | undefined = 
        sessionManager.getLocationMonitorManagerForSession(sessionId);
        if (locationMonitoringManager) {
          console.log(`Session ID ${chalk.magenta(sessionId)} added monitor ${chalk.magenta(monitor.location)}`);
          // Can add monitor.
          // Add new location to monitor to all locations that are monitored.
          locationMonitoringManager.addMonitorLocation(monitor);
          const rainfallLocationManager: LocationMonitoringManager 
            = this.rainfallSessionManager.getLocationMonitorManagerForSession(sessionId);
          const temperatureLocationMonitor: LocationMonitoringManager 
            = this.temperatureSessionManager.getLocationMonitorManagerForSession(sessionId);
          this.weatherClient.retrieveWeatherLocationData(
            monitor.location,
            rainfallLocationManager.getMonitoredLocations().has(monitor.location), 
            temperatureLocationMonitor.getMonitoredLocations().has(monitor.location),
            false
          ).then((weatherLocationData) => {
            socket.emit(addEventName, new RequestResponse(weatherLocationData, null));
          }).catch((error) => {
            console.error(chalk.red(error.message));
            console.error(chalk.red(error.stack));
          });
        } else {
          // Can't add monitor.
          console.error(`${chalk.red('Could add monitor. No session for ID: ')}${chalk.magenta(sessionId)}`);
          const requestError = new RequestError(`Could add monitor ${monitor}.`, `No session for ID: ' ${sessionId}`);
          const response = new RequestResponse(null, requestError);
          socket.emit(addEventName, response);
        }
      } catch (error) {
        const requestError = new RequestError(`Failed to add monitor for location ${monitor}`, error.message);
        const response = new RequestResponse(null, requestError);
        console.error(chalk.red(error.message));
        console.error(chalk.red(error.stack));
        socket.emit(addEventName, response);
      }
    });
    
    socket.on(removeEventName, (monitor: MonitorMetadata) => {
      // monitor is a string that is a location.
      // Frontend emitted remove_monitor with MonitorMetadata.
      try {
        // Note: | means can be type_a or type_b where type_a | type_b.
        const locationMonitoringManager: LocationMonitoringManager | undefined = 
        sessionManager.getLocationMonitorManagerForSession(sessionId);
        if (locationMonitoringManager) {
          console.log(
            `Session ID ${chalk.magenta(sessionId)} ` +
            `removed ${chalk.magenta(removeEventName)} monitor ${chalk.magenta(monitor.location)}`
          );
          // Can remove location.
          locationMonitoringManager.removeMonitoredLocation(monitor);
          socket.emit(removeEventName, new RequestResponse(monitor, null));
        } else {
          // Can't remove location.
          console.error(`${chalk.red('Could remove monitor. No session for ID: ')}${chalk.magenta(sessionId)}`);
          const requestError = new RequestError(
            `Could remove monitor ${monitor}.`,
            `No session for ID: ' ${sessionId}`
          );
          const response = new RequestResponse(null, requestError);
          socket.emit(removeEventName, response);
        }
      } catch (error) {
        const requestError = new RequestError(
          `Failed to remove monitor for location ${monitor}`, 
          error.message
        );
        const response = new RequestResponse(null, requestError);
        console.error(chalk.red(error.message));
        console.error(chalk.red(error.stack));
        socket.emit(removeEventName, response);
      }
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
    // Note: setInterval() doesn't get data at time 0.
    this.retrieveAllMonitoredWeatherData();
    setInterval(
      (): void => { this.retrieveAllMonitoredWeatherData(); },
      defaultWeatherPollingInterval 
    );  
  }

  private onWeatherLocationDataRetrieved(weatherLocationDataList: WeatherLocationData[]) {
    // Logs timestamp and weatherLocationDataList in backend before sending data to frontend.
    // Send updated data to front end.
    const retrievedDataTimeStamp: string = new Date().toString();
    console.log(
      chalk.green('Retrieved') +
      chalk.magenta(` ${weatherLocationDataList.length} `) +
      chalk.green('weather data items at time:') +
      chalk.magenta(` ${retrievedDataTimeStamp} `)
    );
    // Note: sockets.sockets is a Socket IO library attribute.
    for (const sessionId of Object.keys(this.io.sockets.sockets)) {
      try {
        console.info(`Getting monitoring session for session ID: ${chalk.magenta(sessionId)}`);
        const rainfallMonitoringSession: LocationMonitoringManager | undefined = 
          this.rainfallSessionManager.getLocationMonitorManagerForSession(sessionId);
        const temperatureMonitoringSession: LocationMonitoringManager | undefined = 
          this.temperatureSessionManager.getLocationMonitorManagerForSession(sessionId);
        if (rainfallMonitoringSession && temperatureMonitoringSession) {
          const rainfallToEmitWeatherFor: Set<string> = rainfallMonitoringSession.getMonitoredLocations();
          const temperatureToEmitWeatherFor: Set<string> = temperatureMonitoringSession.getMonitoredLocations();
          // We only need to emit data if the user is monitoring a location.
          // Otherwise don't even bother executing the emission code.
          if (rainfallToEmitWeatherFor.size > 0 && temperatureToEmitWeatherFor.size > 0) {
            const weatherDataToEmit: WeatherLocationData[] = [];
            for (const weatherData of weatherLocationDataList) {
              const emitRainfall: boolean = rainfallToEmitWeatherFor.has(weatherData.location);
              const emitTemperature: boolean = temperatureToEmitWeatherFor.has(weatherData.location);
              if (emitTemperature && emitRainfall) {
                weatherDataToEmit.push(weatherData);
              } else if (emitRainfall) {
                weatherDataToEmit.push(new WeatherLocationData(
                  weatherData.location,
                  weatherData.rainfallData,
                  null
                ));
              } else if (emitTemperature) {
                weatherDataToEmit.push(new WeatherLocationData(
                  weatherData.location,
                  null,
                  weatherData.temperatureData
                ));
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

  private getAllMonitoredLocations(): Set<string> {
    const unionedMonitoredLocations: Set<string> = new Set<string>();
    for (const rainfallLocation of this.rainfallSessionManager.getMonitoredLocations()) {
      unionedMonitoredLocations.add(rainfallLocation);
    }
    for (const temperatureLocation of this.temperatureSessionManager.getMonitoredLocations()) {
      unionedMonitoredLocations.add(temperatureLocation);
    }
    return unionedMonitoredLocations;
  }

  private getAllMonitoredLocationsList(): string[] {
    const locationsSet: Set<string> = this.getAllMonitoredLocations();
    const locationIterator: IterableIterator<string> = locationsSet.values();
    const locationsList: string[] = [];
    for (let l = 0; l < locationsSet.size; l++) {
      locationsList[l] = locationIterator.next().value;
    }
    return locationsList;
  }

  private retrieveAllMonitoredWeatherData(): void {
    this.weatherClient.retrieveWeatherLocationDataList(this.getAllMonitoredLocationsList())
      .then((weatherLocationDataList) => {
        this.onWeatherLocationDataRetrieved(weatherLocationDataList);
      }).catch((error) => {
        console.error(chalk.red(error));
        console.error(chalk.red(error.stack));
      });
  }

  public onSoapWeatherClientInitialised(weatherClient: WeatherClient): void {
      console.log(chalk.green('SOAP weather client created'));
      this.weatherClient = weatherClient;
      // This lets any consumers of the API know that we reset the server
      this.onAllLocationsRetrieved([]);
      this.onWeatherLocationDataRetrieved([]);
      // Initialise the socket.io events
      this.initialiseSocketEndpoints();
      // When SOAP Client is resolved which returns melbourneWeatherClient from an async call.
      this.succesfulSoapClientconnection = true;
      this.io.emit(SocketKeys.soapClientCreationSuccess, this.succesfulSoapClientconnection);
      // Get locations from SOAP client in melbourneWeatherClient.
      weatherClient.retrieveLocations().then((locations: string[]) => {
        this.onAllLocationsRetrieved(locations);
      });

  }
  /**
   * Runs main loop for the full lambda service via setInterval.
   */
  public run(): void {
    // Make MelbourneWeatherClient that has a SOAP Client.
    this.weatherClientFactory.createWeatherClient()
      .then((weatherClient: WeatherClient): void => {
        this.onSoapWeatherClientInitialised(weatherClient);
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
