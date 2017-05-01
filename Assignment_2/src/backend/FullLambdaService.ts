import * as chalk from 'chalk';

import { LocationCache } from './LocationCache';
import { LocationMonitoringManager } from '../monitor/LocationMonitoringManager';
import { MelbourneWeatherClient } from '../soap_weather_client/MelbourneWeatherClient';
import { MelbourneWeatherClientFactory } from '../soap_weather_client/MelbourneWeatherClientFactory';
import { MonitorMetadata } from '../model/MonitorMetadata';
import { OnLocationsRetrievedListener } from '../interface/OnLocationsRetrievedListener';
import { OnWeatherRetrievedListener } from '../interface/OnWeatherRetrievedListener';
import { RainfallData } from '../model/RainfallData';
import { RainfallRequestData } from '../model/RainfallRequestData';
import { RequestError } from '../model/RequestError';
import { RequestResponse } from '../model/RequestResponse';
import { SessionMonitoringManager } from '../monitor/SessionMonitoringManager';
import { TemperatureData } from '../model/TemperatureData';
import { TemperatureRequestData } from '../model/TemperatureRequestData';
import { WeatherLocationData } from '../model/WeatherLocationData';

// TODO: Consider if having soft dependencies on Temp & Rainfall & their request data types is better
// allows for dependency injection where you pass in req parameters.

/**
 * Controller class instantiated by the node server.
 */
class FullLambdaService {
  private sessionManager: SessionMonitoringManager = new SessionMonitoringManager();
  // Convention to call SocketIO.Server io.
  private io: SocketIO.Server;
  // All locations retrieved from SOAP client.
  private melbourneWeatherLocations: string[] = [];
  private successfulMelbourneWeather2Connection: boolean = false;
  private locationCache: LocationCache = new LocationCache();
  private melbourneWeatherClient: MelbourneWeatherClient;

  constructor(io: SocketIO.Server) {
    // Set up socketIoServer connections.
    this.io = io;
    this.initialiseSocketEndpoints();
  }
  
  private initialiseSocketEndpoints(): void {
    this.io.sockets.on('connection', (socket: SocketIO.Socket): void => {  
      if (this.successfulMelbourneWeather2Connection) {
        // Emit to front end SOAP Client successfully created.
        this.io.emit('soap_client_creation_success', true);
      } else {
        // Emit to front end SOAP Client creation failed.
        this.io.emit('soap_client_creation_success', false);
        return;
      }
      // Called when session started with frontend.
      const sessionId: string = socket.id;
      console.log(`Session started ${sessionId}`);
      // Add MonitoringManager to manage session with front end client.
      this.sessionManager.addMonitoringSession(sessionId, new LocationMonitoringManager());
      if (this.melbourneWeatherLocations.length > 0) {
        // Send off locations from SOAP client.
        socket.emit('locations', this.melbourneWeatherLocations);
      }

      socket.on('add_monitor', (monitor: MonitorMetadata) => {
        try {
          // Frontend sessions wants to monitor another location.
          // monitor is a string that is a location.
          console.log(`Session ID ${chalk.magenta(sessionId)} added monitor ${chalk.magenta(monitor.location)}`);
          const locationMonitoringManager: LocationMonitoringManager | undefined = 
          this.sessionManager.getLocationMonitorManagerForSession(sessionId);
          if (locationMonitoringManager) {
            // Can add monitor.
            // Add new location to monitor to all locations that are monitored.
            locationMonitoringManager.addMonitorLocation(monitor);
            const monitoredLocations: string[] = Array.from(locationMonitoringManager.getMonitoredLocations());
            this.updateRenderedMonitorsAndCards(monitoredLocations, socket);
          } else {
            // Can't add monitor.
            console.error(`${chalk.red('Could add monitor. No session for ID: ')}${chalk.magenta(sessionId)}`);
            const requestError = new RequestError(`Could add monitor ${monitor}.`, `No session for ID: ' ${sessionId}`);
            const response = new RequestResponse(null, requestError);
            socket.emit('monitored_locations', response);
          }
        } catch (error) {
          const requestError = new RequestError(`Failed to add monitor for location ${monitor}`, error.message);
          const response = new RequestResponse(null, requestError);
          console.error(chalk.red(error.message));
          console.error(chalk.red(error.stack));
          socket.emit('monitored_locations', response);
        }
      });
         
      socket.on('remove_monitor', (monitor: MonitorMetadata) => {
        // monitor is a string that is a location.
        // Frontend emitted remove_monitor with MonitorMetadata.
        try {
          console.log(`Session ID ${chalk.magenta(sessionId)} removed monitor ${chalk.magenta(monitor.location)}`);
          // Note: | means can be type_a or type_b where type_a | type_b.
          const locationMonitoringManager: LocationMonitoringManager | undefined = 
          this.sessionManager.getLocationMonitorManagerForSession(sessionId);
          if (locationMonitoringManager) {
            // Can remove location.
            locationMonitoringManager.removeMonitoredLocation(monitor);
            const monitoredLocations: string[] = Array.from(locationMonitoringManager.getMonitoredLocations());
            this.updateRenderedMonitorsAndCards(monitoredLocations, socket);
          } else {
            // Can't remove location.
            console.error(`${chalk.red('Could remove monitor. No session for ID: ')}${chalk.magenta(sessionId)}`);
            const requestError = new RequestError(`Could remove monitor ${monitor}.`,
              `No session for ID: ' ${sessionId}`);
            const response = new RequestResponse(null, requestError);
            socket.emit('monitored_locations', response);
          }
        } catch (error) {
          const requestError = new RequestError(`Failed to remove monitor for location ${monitor}`, error.message);
          const response = new RequestResponse(null, requestError);
          console.log(chalk.red(error.message));
          console.log(chalk.red(error.stack));
          socket.emit('monitored_locations', response);
        }
      });

      socket.on('disconnect', () => {
        console.log(`Session ended: ${sessionId}`);
        this.sessionManager.removeMonitoringSession(sessionId);
      });
    });
  }

  /**
   * Called when successfully added or removed a monitor. Updates the rendered sidebar and monitor cards.
   */
  private updateRenderedMonitorsAndCards(monitoredLocations: string[], socket: SocketIO.Socket) {
    monitoredLocations.sort();
    // Update sidebar, shows what locations are selected on frontend session.
    // Note: A RequestResponse object is only made for monitored_locations as it is a request from the frontend.
    const response = new RequestResponse(monitoredLocations, null);
    socket.emit('monitored_locations', response);
    // Update data cards displayed on frontend session.
    this.updateRenderedCards(monitoredLocations, socket);
  }

  /**
   * Updates rendered monitor cards on frontend.
   */
  private updateRenderedCards(locations: string[], socket: SocketIO.Socket) {
    // Assume locations is sorted stable order.
    const weatherData: WeatherLocationData[] = [];
    const allPromises: Array<Promise<any>>  = [];
    
    for (const location of locations) {
      if (this.locationCache.has(location)) {
        weatherData.push(this.locationCache.get(location));
      } else {
        let hadError: boolean = false;
        const rainfallRequest = new RainfallRequestData(location);
        let rainfallData: RainfallData;
        const rainfallPromise: Promise<any> = this.melbourneWeatherClient.getRainfall(rainfallRequest)
        .then((rainfallStrings) => {
          rainfallData = new RainfallData(rainfallStrings[1], rainfallStrings[0]);
        })
        .catch((error) => {
          hadError = true;
          console.error(chalk.red(error.message));
          console.error(chalk.red(error.stack));
        });

        const temperatureRequest = new TemperatureRequestData(location);
        let temperatureData: TemperatureData;
        const tempPromise: Promise<any>  = this.melbourneWeatherClient.getTemperature(temperatureRequest)
        .then((temperatureStrings) => {
          temperatureData = new TemperatureData(temperatureStrings[1], temperatureStrings[0]);
        })
        .catch((error) => {
          hadError = true;
          console.error(chalk.red(error.message));
          console.error(chalk.red(error.stack));
        });
        allPromises.push(tempPromise);
        allPromises.push(rainfallPromise);
        const dependentPromises: Array<Promise<string>>  = [rainfallPromise, tempPromise];
        Promise.all(dependentPromises).then((responses) => {
           const weatherDataForALocation: WeatherLocationData = 
            new WeatherLocationData(location, rainfallData, temperatureData);
           weatherData.push(weatherDataForALocation);
           this.locationCache.setLocation(location, weatherDataForALocation);
        })
        .catch((error) => {
          console.error(chalk.red(`Could not make WeatherLocationData for location ${location}`));
        });
      }
    }
    Promise.all(allPromises).then((responses) => {
      socket.emit('replace_weather_data', weatherData);
    })
    .catch((error) => {
      console.error(chalk.bgRed(`getWeatherDataForLocationsMonitored(): Not all promises resolved`));
      console.error(chalk.bgRed(error.message));
      console.log(chalk.bgRed(error.stack));
    });
  }
  
  /**
   * Runs main loop for the full lambda service via setInterval.
   */
  public run(): void {
    // Make MelbourneWeatherClient that has a SOAP Client.
    const that = this;
    new MelbourneWeatherClientFactory().build()
    .then((melbourneWeatherClient): void => {
      // When SOAP Client is resolved which returns melbourneWeatherClient from an async call.
      this.successfulMelbourneWeather2Connection = true;
      that.melbourneWeatherClient = melbourneWeatherClient;

      // Listener to update cache.
      melbourneWeatherClient.addOnWeatherRetrievedListener(
        new class implements OnWeatherRetrievedListener {
          public onWeatherRetrieved(weatherLocationDataList: WeatherLocationData[]): void {
            for (const weatherData of weatherLocationDataList) {
              // Update location cache
              that.locationCache.setLocation(weatherData.location, weatherData);
            }
          }
        }() 
      );
      
      // Listener to update frontends.
      melbourneWeatherClient.addOnWeatherRetrievedListener(
          new class implements OnWeatherRetrievedListener {        
            // Define what to do when weather data is retrieved, specific for to full lambda service.
            public onWeatherRetrieved(weatherLocationDataList: WeatherLocationData[]): void {
              // Logs timestamp and weatherLocationDataList in backend before sending data to frontend.
              // Send updated data to front end.
              const timeStamp: string = new Date().toString();
              console.log(`${chalk.green('Retrieved weather data at time: ')}${timeStamp}`);
              console.log(weatherLocationDataList);
              // Note: sockets.sockets is a Socket IO library attribute.
              for (const sessionId of Object.keys(that.io.sockets.sockets)) {
                // Try tell all frontends to update their weather data.
                try {
                  console.info(`Getting monitoring session for session ID: ${chalk.magenta(sessionId)}`);
                  const monitoringSession: LocationMonitoringManager | undefined = 
                  that.sessionManager.getLocationMonitorManagerForSession(sessionId);
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
          // Define what to do when location data is retrieved.
          // Specific for to full lambda service, only ever called once.
          public onLocationsRetrieved(locations: string[]): void {
            // Retrieves all locations from SOAP client points.
            // Only called once, under the assumption locations are set.
            that.melbourneWeatherLocations = locations.sort();
            // Send locations to front end.
            that.io.sockets.emit('locations', locations);
            console.log(chalk.cyan(`locations: ${locations}`));
            // setInterval() is a JavaScript method that runs the method every msInterval milliseconds.
            // 300000 milliseconds = 5 mins.
            const msInterval = 300000;
            // TODO: Fix so data populated once a session is connected, cache it.
            // Note: setInterval() doesn't get data at time 0.        
            melbourneWeatherClient.retrieveWeatherData(that.sessionManager.getMonitoredLocations());
            setInterval((): void => { 
              melbourneWeatherClient.retrieveWeatherData(that.sessionManager.getMonitoredLocations()); 
            }, msInterval);  
          }
        }()
      );

      // Get locations from SOAP client in melbourneWeatherClient.
      melbourneWeatherClient.retrieveLocations();
    })
    .catch((error) => {
      console.error(chalk.bgRed('Error: SOAP client connection'));
      console.error(chalk.red(error.message));
      console.error(chalk.red(error.stack));
    });
  }
}

export {FullLambdaService};
export default FullLambdaService;
