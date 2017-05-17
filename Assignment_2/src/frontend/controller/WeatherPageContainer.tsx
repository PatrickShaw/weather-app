import * as React from 'react';
import * as SocketIo from 'socket.io-client';

import { AppState } from '../model/AppState';
import { MonitorMetadata } from '../../model/MonitorMetadata';
import { OnLocationItemClickedObserver } from '../observers/OnLocationItemClickedObserver';
import { RequestResponse } from '../../model/RequestResponse';
import SocketKeys from '../../socket.io/socket-keys';
import { WeatherLocationData } from '../../model/WeatherLocationData';
import { WeatherPage } from '../view/WeatherPage';
import { MonitoringData } from '../model/MonitoringData';

/**
 * Decides how the current state of the frontend application is manipulated, which, in turn, causes a 
 * re-render of certain components in the DOM.
 * This is a recommended design pattern provided by Redux (as an example for when you don't use the Redux library) 
 * and React.
 * The class acts as a controller in that it coordinates the events of view objects and the interaction to the 
 * backend API.
 */
class WeatherPageContainer extends React.Component<{}, AppState> {
  private onLocationsListRainfallItemClicked: OnLocationItemClickedObserver;
  private onLocationsListTemperatureItemClicked: OnLocationItemClickedObserver;

  constructor(props: {}) {
    super(props);
    // Start the state off with a bunch of empty lists.
    this.state = new AppState([], new Map<string, MonitoringData>(), false);
  }

  public componentDidMount(): void {
    const that: WeatherPageContainer = this;
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

    // Create on click monitor listeners
    this.onLocationsListRainfallItemClicked = new class implements OnLocationItemClickedObserver {
      public onItemClicked(location: string, selected: boolean): void {
        const originalData: MonitoringData | undefined = that.state.weatherDataMap.get(location);
        let newData: MonitoringData;
        if (originalData == null) {
          newData = new MonitoringData([], !selected, false);
        } else {
          newData = new MonitoringData(
            originalData.weatherDataList, 
            !selected,
            originalData.monitorTemperature
          );
        }
        that.state.weatherDataMap.set(location, newData);
        that.setState({
          weatherDataMap: that.state.weatherDataMap
        });
        that.onMonitorSelected(
          socket, 
          location,
          SocketKeys.addRainfallMonitor, 
          SocketKeys.removeRainfallMonitor,
          selected
        );
      }
    }();

    this.onLocationsListTemperatureItemClicked = new class implements OnLocationItemClickedObserver {
      public onItemClicked(location: string, selected: boolean): void {
        const originalData: MonitoringData | undefined = that.state.weatherDataMap.get(location);
        let newData: MonitoringData;
        if (originalData == null) {
          newData = new MonitoringData([], false, !selected);
        } else {
          newData = new MonitoringData(
            originalData.weatherDataList, 
            originalData.monitorRainfall,
            !selected
          );
        }
        that.state.weatherDataMap.set(location, newData);
        that.setState({
          weatherDataMap: that.state.weatherDataMap
        });
        that.onMonitorSelected(
          socket,
          location,
          SocketKeys.addTemperatureMonitor,
          SocketKeys.removeTemperatureMonitor,
          selected
        );
      }
    }();

    // Initialize the socket end points for each type of monitor
    this.initializeMonitoringSocketEndPoint(
      socket, 
      SocketKeys.addRainfallMonitor, 
      SocketKeys.removeRainfallMonitor
    );
    
    this.initializeMonitoringSocketEndPoint(
      socket, 
      SocketKeys.addTemperatureMonitor, 
      SocketKeys.removeTemperatureMonitor
    );

    socket.on(SocketKeys.successfulServerSetup, (connectedToServer: boolean) => {
      // Remove the 'waiting for client connection' view once the server has set itself up.
      // Assign MelbourneWeather2 successful connection status.
      console.log(`Successful connection to server: ${connectedToServer}`);
      this.setState({ connectedToServer });
    });

    socket.on(SocketKeys.retrievedLocations, (locations: string[]) => {
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
        
      // console.log(weatherLocationDataList); 
      const newWeatherDataMap: Map<string, MonitoringData> = that.state.weatherDataMap;
      for (const weatherLocationData of weatherLocationDataList) {
        let monitoringData: MonitoringData | undefined = newWeatherDataMap.get(weatherLocationData.location);
        if (monitoringData == null) {
          monitoringData = new MonitoringData(
            [], 
            weatherLocationData.rainfallData != null, 
            weatherLocationData.temperatureData != null
          );
          newWeatherDataMap.set(weatherLocationData.location, monitoringData);
        }
        monitoringData.weatherDataList.push(weatherLocationData);
      }
      this.setState({ weatherDataMap: newWeatherDataMap });
    });
  }

  public onMonitorSelected(
    socket: SocketIOClient.Socket,
    location: string,
    addMonitorEvent: string, 
    removeMonitorEvent: string,
    selected: boolean
  ): void {
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

  private initializeMonitoringSocketEndPoint(
    socket: SocketIOClient.Socket,
    addMonitorEvent: string,
    removeMonitorEvent: string
  ): void {
    socket.on(addMonitorEvent, (addMonitorResponse: RequestResponse<WeatherLocationData>) => {
      // First, make sure we didn't receive an error.
      if (addMonitorResponse.error == null) {
        // Good, we didn't receive an error, add the new weather data into our state's weather hash map.
        const newWeatherData: WeatherLocationData = addMonitorResponse.data;
        const weatherDataMap: Map<string, MonitoringData> = this.state.weatherDataMap;
        const monitoringData: MonitoringData | undefined = weatherDataMap.get(newWeatherData.location);
        if (monitoringData != null) {
          weatherDataMap.set(newWeatherData.location, monitoringData);
          monitoringData.weatherDataList.push(newWeatherData);
        } else {
          console.error('Could not find monitoring data');
        }
        this.setState({ weatherDataMap });
      } else {
        console.error(addMonitorResponse.error);
      }
    });
    
    socket.on(removeMonitorEvent, (removeMonitorResponse: RequestResponse<WeatherLocationData>) => {
      // Make sure we didn't receive an error when we tried to remove the monitor
      if (removeMonitorResponse.error != null) {
        console.error(removeMonitorResponse.error);
      }
    });
  }
  
  public render(): JSX.Element {
    // console.log(this.state.weatherDataMap);
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
        <h1 className='error'>
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
