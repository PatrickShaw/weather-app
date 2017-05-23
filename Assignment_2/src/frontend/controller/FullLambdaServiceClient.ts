/**
 * The following file is effectively a wrapper around the socket.io communications between the 
 * client and server. You can listen in on what the client is doing via a series of observer interfaces.
 * Please note that, for addMonitorEvent and removeMonitorEvent we would be better off using a REST API as
 * socket.io is not designed for that kind of thing.
 * 
 * The code is quite basic so comments will be left to a minimum.
 */
import { MonitorMetadata } from '../../model/MonitorMetadata';
import { RequestResponse } from '../../model/RequestResponse';
import {WeatherLocationData} from '../../model/WeatherLocationData';
import SocketKeys from '../../socket.io/socket-keys';
interface OnMonitorAddedObserver {
  onMonitorAdded(response: RequestResponse<WeatherLocationData>);
}

interface OnMonitorRemovedObserver {
  onMonitorRemoved(response: RequestResponse<MonitorMetadata>);
}

interface OnLocationsRetrievedObserver {
  onLocationsRetrieved(repsonse: string[]);
}

interface OnServerSetupSucessRetrievedObserver {
  onServerSetupSuccessRetrieved(success: boolean);
}

interface OnWeatherLocationDataListRetrievedObserver {
  onWeatherLocationDataListRetrieved(weatherLocationDataList: WeatherLocationData[]);
}

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
    this.initialiseSocketEndPoints();
  }

  /**
   * Sets up the socket.on methods.
   */
  public initialiseSocketEndPoints() {
    this.socket.on(this.addMonitorEvent, (response: RequestResponse<WeatherLocationData>) => {
      for (const observer of this.onMonitorAddedObservers) {
        observer.onMonitorAdded(response);
      }
    });

    this.socket.on(this.removeMonitorEvent, (response: RequestResponse<MonitorMetadata>) => {
      for (const observer of this.onMonitorRemovedObservers) {
        observer.onMonitorRemoved(response);
      }
    });
  }
  
  public addMonitorAddedObserver(observer: OnMonitorAddedObserver) {
    this.onMonitorAddedObservers.add(observer);
  }

  public removeMonitorAddedObserver(observer: OnMonitorAddedObserver) {
    this.onMonitorAddedObservers.delete(observer);
  }
  
  public addMonitorRemovedObserver(observer: OnMonitorRemovedObserver) {
    this.onMonitorRemovedObservers.add(observer);
  }
  
  public removeMonitorRemovedObserver(observer: OnMonitorRemovedObserver) {
    this.onMonitorRemovedObservers.delete(observer);
  }
  
  public addMonitor(monitorMetadata: MonitorMetadata) {
    if (monitorMetadata == null) {
      throw new Error('Monitoring metadata was null.');
    }
    if (monitorMetadata.location == null) {
      throw new Error('Monitoring metadata location was null');
    }
    this.socket.emit(this.addMonitorEvent, monitorMetadata);
  }
  
  public removeMonitor(monitorMetadata: MonitorMetadata) {
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
  private readonly onServerSetupSuccessRetrievedObservers: Set<OnServerSetupSucessRetrievedObserver>;
  public readonly rainfallMonitorConnection: MonitorConnection;
  public readonly temperatureMonitorConnection: MonitorConnection;
  constructor(socket: SocketIOClient.Socket) {
    this.socket = socket;
    this.onLocationsRetrievedObservers = new Set<OnLocationsRetrievedObserver>();
    this.onWeatherLocationDataListRetrievedObservers = new Set<OnWeatherLocationDataListRetrievedObserver>();
    this.onServerSetupSuccessRetrievedObservers = new Set<OnServerSetupSucessRetrievedObserver>();
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
    this.socket.on(SocketKeys.replaceWeatherData, (weatherDataList: WeatherLocationData[]) => {
      for (const observer of this.onWeatherLocationDataListRetrievedObservers) {
        observer.onWeatherLocationDataListRetrieved(weatherDataList);
      }
    });
    this.socket.on(SocketKeys.retrievedLocations, (locations) => {
      for (const observer of this.onLocationsRetrievedObservers) {
        observer.onLocationsRetrieved(locations);
      }
    });
    this.socket.on(SocketKeys.successfulServerSetup, (success: boolean) => {
      for (const observer of this.onServerSetupSuccessRetrievedObservers) {
        observer.onServerSetupSuccessRetrieved(success);
      }
    });
  }

  public addOnWeatherLocationDataListRetrievedObserver(observer: OnWeatherLocationDataListRetrievedObserver) {
    this.onWeatherLocationDataListRetrievedObservers.add(observer);
  }
  
  public removeOnWeatherLocationDataListRetrievedObserver(observer: OnWeatherLocationDataListRetrievedObserver) {
    this.onWeatherLocationDataListRetrievedObservers.delete(observer);
  }

  public addOnServerSetupSuccessRetrievedObserver(observer: OnServerSetupSucessRetrievedObserver) {
    this.onServerSetupSuccessRetrievedObservers.add(observer);
  }

  public removeOnServerSetupSuccessRetrievedObserver(observer: OnServerSetupSucessRetrievedObserver) {
    this.onServerSetupSuccessRetrievedObservers.delete(observer);
  }

  public addOnLocationsRetrievedObserver(observer: OnLocationsRetrievedObserver) {
    this.onLocationsRetrievedObservers.add(observer);
  }

  public removeOnLocationRetrievedObserver(observer: OnLocationsRetrievedObserver) {
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
  OnServerSetupSucessRetrievedObserver
};
export default FullLambdaServiceClient;
