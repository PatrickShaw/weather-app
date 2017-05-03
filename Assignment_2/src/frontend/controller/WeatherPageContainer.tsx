import * as SocketIo from 'socket.io-client';
import * as React from 'react';
import { AppState } from '../model/AppState';
import { OnLocationItemClickedObserver } from '../observers/OnLocationItemClickedObserver';
import { RequestResponse } from '../../model/RequestResponse';
import { MonitorMetadata } from '../../model/MonitorMetadata';
import { WeatherPage } from '../view/WeatherPage';
import { WeatherLocationData } from '../../model/WeatherLocationData';
import SocketKeys from '../../socket.io/socket-keys';

/**
 * Decides how the current state of the frontend application is manipulated, which, in turn, causes a 
 * re-render of certain components in the DOM.
 */
class WeatherPageContainer extends React.Component<{}, AppState> {
  private onLocationsListRainfallItemClicked: OnLocationItemClickedObserver;
  private onLocationsListTemperatureItemClicked: OnLocationItemClickedObserver;

  constructor(props: {}) {
    super(props);
    this.state = new AppState([], new Map<string, WeatherLocationData>(), false);
  }

  public componentDidMount(): void {
    // Connects to the port that the backend is listening on.
    // Triggers io.on('connection')'s callback
    const socket: SocketIOClient.Socket = SocketIo.connect('http://127.0.0.1:8080');
    this.onLocationsListRainfallItemClicked = new class implements OnLocationItemClickedObserver {
      public onItemClicked(location: string, selected: boolean): void {
        // The backend speaks in MonitorMetadata objects, so create one.
        const monitor: MonitorMetadata = new MonitorMetadata(location);
        if (selected) {
          // We're unselecting a location so emit to remove the monitor
          socket.emit(SocketKeys.removeRainfallMonitor, monitor);
        } else {
          // We're selecting a location so emit to add the monitor
          socket.emit(SocketKeys.addRainfallMonitor, monitor);
        }
      }
    }();

    this.onLocationsListRainfallItemClicked = this.createOnChangeMonitorListener(
      socket, SocketKeys.addRainfallMonitor, SocketKeys.removeRainfallMonitor
    );
    this.onLocationsListTemperatureItemClicked = this.createOnChangeMonitorListener(
      socket, SocketKeys.addTemperatureMonitor, SocketKeys.removeTemperatureMonitor
    );

    this.initialiseMonitoringSocketEndPoint(
      socket, 
      SocketKeys.addRainfallMonitor, 
      SocketKeys.removeRainfallMonitor,
      (removedLocation: string, weatherData: WeatherLocationData) => { 
        return new WeatherLocationData(removedLocation, undefined, weatherData.temperatureData); 
      }
    );
    
    this.initialiseMonitoringSocketEndPoint(
      socket, 
      SocketKeys.addTemperatureMonitor, 
      SocketKeys.removeTemperatureMonitor,
      (removedLocation: string, weatherData: WeatherLocationData) => { 
        return new WeatherLocationData(removedLocation, weatherData.rainfallData, undefined); 
      }
    );

    socket.on(SocketKeys.successfulServerSetup, (connectedToServer: boolean) => {
      // Assign MelbourneWeather2 successful connection status.
      console.log(`Successful connection to server: ${connectedToServer}`);
      this.setState({ connectedToServer });
    });

    socket.on(SocketKeys.retrievedLocations, (locations: string[]) => {
      console.log(locations);
      // We were given a list of locations. Let React know that we may need to re-render.
      this.setState({ locations });
    });

    socket.on(SocketKeys.replaceWeatherData, (weatherLocationDataList: WeatherLocationData[]) => {
      // Handle updates for cards.
      // We received some fresh weather data.
      // Tell React that we may need to re-render
      const timeStamp: string = new Date().toString();
      console.log('Received weather location data at time: ' + timeStamp);
      console.log(weatherLocationDataList); 
      const newWeatherDataMap: Map<string, WeatherLocationData> = new Map<string, WeatherLocationData>();
      for (const weatherLocationData of weatherLocationDataList) {
        newWeatherDataMap.set(weatherLocationData.location, weatherLocationData);
      }
      this.setState({ weatherDataMap: newWeatherDataMap });
    });
  }

  public createOnChangeMonitorListener(
    socket: SocketIOClient.Socket,
    addMonitorEvent: string, 
    removeMonitorEvent: string
  ): OnLocationItemClickedObserver {
    return new class implements OnLocationItemClickedObserver {
      public onItemClicked(location: string, selected: boolean): void {
        // The backend speaks in MonitorMetadata objects, so create one.
        const monitor: MonitorMetadata = new MonitorMetadata(location);
        if (selected) {
          // We're unselecting a location so emit to remove the monitor
          socket.emit(removeMonitorEvent, monitor);
        } else {
          // We're selecting a location so emit to add the monitor
          socket.emit(addMonitorEvent, monitor);
        }
      }
    }();
  }

  private initialiseMonitoringSocketEndPoint(
    socket: SocketIOClient.Socket,
    addMonitorEvent: string,
    removeMonitorEvent: string,
    filterWeatherLocationData: (location: string, weatherData: WeatherLocationData) => WeatherLocationData
  ): void {
    socket.on(addMonitorEvent, (addMonitorResponse: RequestResponse<WeatherLocationData>) => {
      if (addMonitorResponse.error == null) {
        const newWeatherData: WeatherLocationData = addMonitorResponse.data;
        const weatherDataMap: Map<string, WeatherLocationData> = this.state.weatherDataMap;
        weatherDataMap.set(newWeatherData.location, newWeatherData);
        this.setState({ weatherDataMap });
      } else {
        console.error(addMonitorResponse.error);
      }
    });
    
    socket.on(removeMonitorEvent, (removeMonitorResponse: RequestResponse<MonitorMetadata>) => {
      if (removeMonitorResponse.error == null) {
        const removedMonitor = removeMonitorResponse.data;
        const weatherDataMap: Map<string, WeatherLocationData> = this.state.weatherDataMap;
        const originalWeatherData: WeatherLocationData | undefined = weatherDataMap.get(removedMonitor.location);
        if (originalWeatherData != null) {
          const newWeatherData: WeatherLocationData = 
            filterWeatherLocationData(originalWeatherData.location, originalWeatherData);
          if (newWeatherData.rainfallData == null && newWeatherData.temperatureData == null) {
            console.log('DELETE!');
            weatherDataMap.delete(newWeatherData.location);
          } else {
           console.log('SET!');
           weatherDataMap.set(newWeatherData.location, newWeatherData);
          }
        }
        this.setState({ weatherDataMap });
      } else {
        console.error(removeMonitorResponse.error);
      }
    });
  }
  
  public render(): JSX.Element {
    console.log(this.state.weatherDataMap);
    return (
      this.state.connectedToServer ?
      (
        <WeatherPage 
          appCurrentState={this.state}
          onLocationRainfallItemClickedObserver={this.onLocationsListRainfallItemClicked}
          onLocationTemperatureItemClickedObserver={this.onLocationsListTemperatureItemClicked}
        />
      ) : 
      (
        <h1 className="error">
            WeatherMelbourne2 WSDL connection unsuccessful. 
            Make sure your device is connected to the internet and 
            http://viper.infotech.monash.edu.au:8180/axis2/services/MelbourneWeather2?wsdl is available.
        </h1>
      )
    );
  }
}

export {WeatherPageContainer};
export default WeatherPageContainer;
