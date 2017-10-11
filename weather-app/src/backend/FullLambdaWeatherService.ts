import * as chalk from 'chalk';

import { LocationMonitoringManager } from '../monitor/LocationMonitoringManager';
import { MonitorMetadata } from '../model/MonitorMetadata';
import { RequestError } from '../model/RequestError';
import { RequestResponse } from '../model/RequestResponse';
import { SessionMonitoringManager } from '../monitor/SessionMonitoringManager';
import SocketKeys from '../socket.io/socket-keys';
import { WeatherClient } from '../weather_client/WeatherClient';
import { WeatherClientFactory } from '../weather_client/WeatherClientFactory';
import { WeatherLocationData } from '../model/WeatherLocationData';

/**
 * Controller class instantiated by the node server. This specifies the core logic specified in 
 * assignment 1 of FIT3077. Although the class may look giant, the majority of the service consists of comments, 
 * try-catches and methods seperated over multiple lines.
 */
class FullLambdaWeatherService {
  // We use this for building a weather client
  // We decided to pass in the weather client's factory because we intend on giving this class the 
  // responsibility of retrying the weather client building.
  private readonly weatherClientFactory: WeatherClientFactory<WeatherClient>;
  // A array to help with some of the duplicate code that the rainfall and temperature managers share
  private readonly monitoringDataList: MonitoringManagerData[];
  private readonly rainfallMonitoringData: MonitoringManagerData;
  private readonly temperatureMonitoringData: MonitoringManagerData;  
  // Specifies how often we poll for data
  private readonly weatherPollingInterval: number;
  // It's convention to call SocketIO.Server io.
  private readonly io: SocketIO.Server;
  // Contains all locations retrieved from weather client.
  private melbourneWeatherLocations: string[];
  // Specifies whether we have successfully made a connection to the weather client.
  private successfulWeatherClientSetup: boolean;
  // Our client that we retrieve weather data from. 
  private weatherClient: WeatherClient;

  constructor(
    io: SocketIO.Server, 
    weatherClientFactory: WeatherClientFactory<WeatherClient>,
    // 300000 milliseconds = 5 mins.
    weatherInterval: number = 300000
  ) {
    // Weather client hasn't been built yet so this is false.
    this.successfulWeatherClientSetup = false;
    // Locations will be empty for now, better than nothing.
    this.melbourneWeatherLocations = [];
    this.io = io;
    this.weatherClientFactory = weatherClientFactory;
    // Time to compile our monitoring manager data
    // Could probably dependency inject the SessionMontoringManager but that's a bit overkill
    this.rainfallMonitoringData = new MonitoringManagerData(
      new SessionMonitoringManager(),
      SocketKeys.addRainfallMonitor,
      SocketKeys.removeRainfallMonitor
    );
    this.temperatureMonitoringData = new MonitoringManagerData(
      new SessionMonitoringManager(),
      SocketKeys.addTemperatureMonitor,
      SocketKeys.removeTemperatureMonitor
    );
    
    this.monitoringDataList = [
      this.rainfallMonitoringData,
      this.temperatureMonitoringData
    ];
    this.weatherPollingInterval = weatherInterval;
  }
  
  /**
   * We need to setup the websocket end points so that consumers of the API can actually communicate with 
   * the API itself. This method does just that.
   */
  private initializeSocketEndpoints(): void {
    this.io.sockets.on('connection', (socket: SocketIO.Socket): void => {  
      // Called when session started with frontend.
      const sessionId: string = socket.id;
      // console.log(`Session started ${sessionId}`);
      // Pass them some fresh data, if the server went down, we should let the API consumers
      socket.emit(SocketKeys.retrievedLocations, this.melbourneWeatherLocations);
      socket.emit(SocketKeys.replaceWeatherData, []);
      // Add MonitoringManagerData to manage session with front end client.
      for (const monitoringManager of this.monitoringDataList) {
        monitoringManager.sessionManager.addMonitoringSession(sessionId, new LocationMonitoringManager());
        this.initializeMonitorSocketEvent(
          socket,
          monitoringManager.addMonitorEventName,
          monitoringManager.removeMonitorEventName,
          monitoringManager.sessionManager
        );
      }

      socket.on('disconnect', () => {
        // console.log(`Session ended: ${sessionId}`);
        // Once a session has ended we need to remove it from our records so that the API doesn't try 
        // emit data to the disconnected socket.
        for (const monitoringManager of this.monitoringDataList) {
          monitoringManager.sessionManager.removeMonitoringSession(sessionId);
        }
      });

      // Emit to front end whether the SOAP Client was successfully created.
      socket.emit(SocketKeys.successfulServerSetup, this.successfulWeatherClientSetup);
    });
  }
  
  // Initialized for rainfall and temperature (called twice).
  private initializeMonitorSocketEvent(
    socket: SocketIO.Socket,
    addEventName: string, 
    removeEventName: string,
    sessionManager: SessionMonitoringManager
  ): void {
    const sessionId = socket.id;
    // Triggered when frontend emits socket.emit(addMonitorEvent, monitor);
    socket.on(addEventName, (monitor: MonitorMetadata) => {
      try {
        // Frontend sessions wants to monitor another location.
        // monitor is a string that is a location.
        const locationMonitoringManager: LocationMonitoringManager | undefined = 
          sessionManager.getLocationMonitorManagerForSession(sessionId);
        if (locationMonitoringManager) {
          // console.log(`Session ID ${chalk.magenta(sessionId)} added monitor ${chalk.magenta(monitor.location)}`);
          // Can add monitor.
          // Add new location to monitor to all locations that are monitored.
          locationMonitoringManager.addMonitorLocation(monitor);
          
          const rainfallLocationManager: LocationMonitoringManager 
            = this.rainfallMonitoringData.sessionManager.getLocationMonitorManagerForSession(sessionId);
          const temperatureLocationMonitor: LocationMonitoringManager 
            = this.temperatureMonitoringData.sessionManager.getLocationMonitorManagerForSession(sessionId);
          // Time to get the data from the weather client and emit to the socket who added the monitor
          this.weatherClient.retrieveWeatherLocationData(
            monitor.location,
            rainfallLocationManager.getMonitoredLocations().has(monitor.location), 
            temperatureLocationMonitor.getMonitoredLocations().has(monitor.location),
            false
          ).then((weatherLocationData) => {
            const responseObject: RequestResponse<WeatherLocationData> = new RequestResponse(weatherLocationData, null);
            socket.emit(addEventName, responseObject);
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
    
    // Triggered when frontend emits socket.emit(removeMonitorEvent, monitor);
    socket.on(removeEventName, (monitor: MonitorMetadata) => {
      // monitor is a string that is a location.
      // Frontend emitted remove_monitor with MonitorMetadata.
      try {
        // Note: | means can be type_a or type_b where type_a | type_b.
        const locationMonitoringManager: LocationMonitoringManager | undefined = 
          sessionManager.getLocationMonitorManagerForSession(sessionId);
        if (locationMonitoringManager) {
          /*console.log(
            `Session ID ${chalk.magenta(sessionId)} ` +
            `removed ${chalk.magenta(removeEventName)} monitor ${chalk.magenta(monitor.location)}`
          );*/
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

  private onAllLocationsRetrieved(locations: string[]): void {
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
      this.weatherPollingInterval 
    );  
  }

  /**
   * Called at intervals once all weather data for monitored locations retrieved.
   */
  private onWeatherLocationDataRetrieved(weatherLocationDataList: WeatherLocationData[]): void {
    // Logs timestamp and weatherLocationDataList in backend before sending data to frontend.
    // Send updated data to front end.
    /*const retrievedDataTimeStamp: string = new Date().toString();
    console.log(
      chalk.green('Retrieved') +
      chalk.magenta(` ${weatherLocationDataList.length} `) +
      chalk.green('weather data items at time:') +
      chalk.magenta(` ${retrievedDataTimeStamp} `)
    );*/

    // weatherLocationDataList.forEach((weatherLocationData) => {
    //   console.log(chalk.cyan(weatherLocationData.toString()));
    // });

    // Note: sockets.sockets is a Socket IO library attribute.
    for (const sessionId of Object.keys(this.io.sockets.sockets)) {
      try {
        // console.info(`Getting monitoring session for session ID: ${chalk.magenta(sessionId)}`);
        let validSessionMonitors: boolean = true;
        for (const monitoringSession of this.monitoringDataList) {
          const sessionManager: SessionMonitoringManager = monitoringSession.sessionManager;
          if (!sessionManager) {
            validSessionMonitors = false;
            break;
          }
        }
        if (!validSessionMonitors) {
          console.error(
            chalk.red(`Socket ${chalk.magenta(sessionId)} had no monitoring session. Skipping emit.`)
          ); 
          continue; 
        }

        let hasDataToEmit: boolean = false;
        for (const monitoringSession of this.monitoringDataList) {
          if (monitoringSession.sessionManager.getAllMonitoredLocations().size > 0) {
            hasDataToEmit = true;
            break;
          }
        }
        if (!hasDataToEmit) {
          console.log(`Session ID ${chalk.magenta(sessionId)} wasn't monitoring anything, skipping emission.`);
          continue;
        }

        // Data to emit for this session.
        const rainfallToEmitWeatherFor: Set<string> 
          = this.rainfallMonitoringData.sessionManager.getLocationMonitorManagerForSession(sessionId).
            getMonitoredLocations();
        const temperatureToEmitWeatherFor: Set<string> 
          = this.temperatureMonitoringData.sessionManager.getLocationMonitorManagerForSession(sessionId).
            getMonitoredLocations();
                  
        // We only need to emit data if the user is monitoring a location.
        // Otherwise don't even bother executing the emission code.
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
      } catch (error) {
        console.error(chalk.bgRed(error.message));
        console.error(chalk.red(error.stack));
      }
    }
  }

  private getAllMonitoredLocations(): Set<string> {
    const unionedMonitoredLocations: Set<string> = new Set<string>();
    for (const monitoringManager of this.monitoringDataList) {
      for (const location of monitoringManager.sessionManager.getAllMonitoredLocations()) {
        unionedMonitoredLocations.add(location);
      }
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

  private onSoapWeatherClientInitialized(weatherClient: WeatherClient): void {
    console.log(chalk.green('SOAP weather client created'));
    this.weatherClient = weatherClient;
    // This lets any consumers of the API know that we reset the server
    this.io.sockets.emit(SocketKeys.retrievedLocations, []);
    this.io.sockets.emit(SocketKeys.replaceWeatherData, []);
    // Initialize the socket.io events
    this.initializeSocketEndpoints();
    // When SOAP Client is resolved which returns melbourneWeatherClient from an async call.
    this.successfulWeatherClientSetup = true;
    this.io.sockets.emit(SocketKeys.successfulServerSetup, this.successfulWeatherClientSetup);
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
        this.onSoapWeatherClientInitialized(weatherClient);
      })
      .catch((error) => {
        console.error(chalk.bgRed('Failed to create SOAP client connection'));
        console.error(chalk.red(error.message));
        console.error(chalk.red(error.stack));
      });
  }
}

class MonitoringManagerData {
  public readonly sessionManager: SessionMonitoringManager;
  public readonly addMonitorEventName: string;
  public readonly removeMonitorEventName: string;
  constructor(
    sessionManager: SessionMonitoringManager,
    addMonitorEventName: string,
    removeMonitorEventName: string
  ) {
    this.sessionManager = sessionManager;
    this.addMonitorEventName = addMonitorEventName;
    this.removeMonitorEventName = removeMonitorEventName;
  }
}

export {FullLambdaWeatherService};
export default FullLambdaWeatherService;
