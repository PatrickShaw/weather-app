/**
 * The following file is effectively a wrapper around the socket.io communications between the 
 * client and server. You can listen in on what the client is doing via a series of observer interfaces.
 * Please note that, for addMonitorEvent and removeMonitorEvent we would be better off using a REST API as
 * socket.io is not designed for that kind of thing. 
 */
import { MonitorMetadata } from '../model/MonitorMetadata';
import { RequestResponse } from '../model/RequestResponse';
import SocketKeys from '../socket.io/socket-keys';
import { WeatherLocationData } from '../model/WeatherLocationData';
type OnMonitorAddedObserver = (response: RequestResponse<WeatherLocationData>) => void;
type OnMonitorRemovedObserver = (response: RequestResponse<MonitorMetadata>) => void;
type OnLocationsRetrievedObserver = (response: string[]) => void;
type OnServerSetupSuccessRetrievedObserver = (success: boolean) => void;
type OnWeatherLocationDataListRetrievedObserver = (weatherLocationDataList: WeatherLocationData[]) => void;

/**
 * Essentially just a wrapper around the add and remove socket IO events.
 */
class MonitorConnection {
  private readonly socket: SocketIOClient.Socket;
  private readonly onMonitorAddedObservers: Set<OnMonitorAddedObserver>;
  private readonly onMonitorRemovedObservers: Set<OnMonitorRemovedObserver>;
  private readonly removeMonitorEvent: string;
  private readonly addMonitorEvent: string;
  
  constructor(socket: SocketIOClient.Socket, addMonitorEvent: string, removeMonitorEvent: string) {
    this.socket = socket;
    this.onMonitorAddedObservers = new Set<OnMonitorAddedObserver>();
    this.onMonitorRemovedObservers = new Set<OnMonitorRemovedObserver>();
    this.addMonitorEvent = addMonitorEvent;
    this.removeMonitorEvent = removeMonitorEvent;
    this.initializeSocketEndPoints();
  }

  /**
   * Sets up the socket.on methods.
   */
  public initializeSocketEndPoints(): void {
    this.socket.on(this.addMonitorEvent, (response: RequestResponse<WeatherLocationData>) => {
      for (const observer of this.onMonitorAddedObservers) {
        observer(response);
      }
    });

    this.socket.on(this.removeMonitorEvent, (response: RequestResponse<MonitorMetadata>) => {
      for (const observer of this.onMonitorRemovedObservers) {
        observer(response);
      }
    });
  }
  
  public addMonitorAddedObserver(observer: OnMonitorAddedObserver): void {
    this.onMonitorAddedObservers.add(observer);
  }

  public removeMonitorAddedObserver(observer: OnMonitorAddedObserver): void {
    this.onMonitorAddedObservers.delete(observer);
  }
  
  public addMonitorRemovedObserver(observer: OnMonitorRemovedObserver): void {
    this.onMonitorRemovedObservers.add(observer);
  }
  
  public removeMonitorRemovedObserver(observer: OnMonitorRemovedObserver): void {
    this.onMonitorRemovedObservers.delete(observer);
  }
  
  public addMonitor(monitorMetadata: MonitorMetadata): void {
    if (monitorMetadata == null) {
      throw new Error('Monitoring metadata was null.');
    }
    if (monitorMetadata.location == null) {
      throw new Error('Monitoring metadata location was null');
    }
    this.socket.emit(this.addMonitorEvent, monitorMetadata);
  }
  
  public removeMonitor(monitorMetadata: MonitorMetadata): void {
    if (monitorMetadata == null) {
      throw new Error('Monitoring metadata was null.');
    }
    if (monitorMetadata.location == null) {
      throw new Error('Monitoring metadata location was null');
    }
    this.socket.emit(this.removeMonitorEvent, monitorMetadata);
  }
}

class FullLambdaServiceClient {
  private readonly socket: SocketIOClient.Socket;
  private readonly onLocationsRetrievedObservers: Set<OnLocationsRetrievedObserver>;
  private readonly onWeatherLocationDataListRetrievedObservers: Set<OnWeatherLocationDataListRetrievedObserver>;
  private readonly onServerSetupSuccessRetrievedObservers: Set<OnServerSetupSuccessRetrievedObserver>;
  public readonly rainfallMonitorConnection: MonitorConnection;
  public readonly temperatureMonitorConnection: MonitorConnection;
  constructor(socket: SocketIOClient.Socket) {
    this.socket = socket;
    this.onLocationsRetrievedObservers = new Set<OnLocationsRetrievedObserver>();
    this.onWeatherLocationDataListRetrievedObservers = new Set<OnWeatherLocationDataListRetrievedObserver>();
    this.onServerSetupSuccessRetrievedObservers = new Set<OnServerSetupSuccessRetrievedObserver>();
    this.rainfallMonitorConnection = new MonitorConnection(
      socket, 
      SocketKeys.addRainfallMonitor, 
      SocketKeys.removeRainfallMonitor
    );
    this.temperatureMonitorConnection = new MonitorConnection(
      socket,
      SocketKeys.addTemperatureMonitor,
      SocketKeys.removeTemperatureMonitor
    );
    // When socket.on('even') occurs, trigger observers.
    this.socket.on(SocketKeys.replaceWeatherData, (weatherDataList: WeatherLocationData[]) => {
      for (const observer of this.onWeatherLocationDataListRetrievedObservers) {
        observer(weatherDataList);
      }
    });
    this.socket.on(SocketKeys.retrievedLocations, (locations) => {
      for (const observer of this.onLocationsRetrievedObservers) {
        observer(locations);
      }
    });
    this.socket.on(SocketKeys.successfulServerSetup, (success: boolean) => {
      for (const observer of this.onServerSetupSuccessRetrievedObservers) {
        observer(success);
      }
    });
  }
  // Add/remove observers.
  public addOnWeatherLocationDataListRetrievedObserver(observer: OnWeatherLocationDataListRetrievedObserver): void {
    this.onWeatherLocationDataListRetrievedObservers.add(observer);
  }
  
  public removeOnWeatherLocationDataListRetrievedObserver(observer: OnWeatherLocationDataListRetrievedObserver): void {
    this.onWeatherLocationDataListRetrievedObservers.delete(observer);
  }

  public addOnServerSetupSuccessRetrievedObserver(observer: OnServerSetupSuccessRetrievedObserver): void {
    this.onServerSetupSuccessRetrievedObservers.add(observer);
  }

  public removeOnServerSetupSuccessRetrievedObserver(observer: OnServerSetupSuccessRetrievedObserver): void {
    this.onServerSetupSuccessRetrievedObservers.delete(observer);
  }

  public addOnLocationsRetrievedObserver(observer: OnLocationsRetrievedObserver): void {
    this.onLocationsRetrievedObservers.add(observer);
  }

  public removeOnLocationRetrievedObserver(observer: OnLocationsRetrievedObserver): void {
    this.onLocationsRetrievedObservers.delete(observer);
  }
}

export {
  FullLambdaServiceClient, 
  OnMonitorAddedObserver, 
  OnMonitorRemovedObserver, 
  MonitorConnection,
  OnLocationsRetrievedObserver,
  OnWeatherLocationDataListRetrievedObserver,
  OnServerSetupSuccessRetrievedObserver
};
export default FullLambdaServiceClient;
