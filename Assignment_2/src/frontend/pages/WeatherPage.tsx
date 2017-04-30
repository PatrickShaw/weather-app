import './WeatherPage.scss';

import * as React from 'react';
import * as SocketIo from 'socket.io-client';

import {ActionBar} from '../components/AppBar';
import {AppState} from '../model/AppState';
import {LocationList} from '../components/LocationList';
import {MonitorMetadata} from '../../model/MonitorMetadata';
import {MonitoringList} from '../components/MonitoringList';
import {OnLocationItemClickedObserver} from '../observers/OnLocationItemClickedObserver';
import {RainfallData} from '../../model/RainfallData';
import {TemperatureData} from '../../model/TemperatureData';
import {WeatherLocationData} from '../../model/WeatherLocationData';

interface WeatherPageProps extends AppState {
  onLocationsListItemClicked?: OnLocationItemClickedObserver;
}

class WeatherPage extends React.Component<WeatherPageProps, void> {
  public render(): JSX.Element {
    return (
      <div className="weather-page">
        <div className="page-heading">
          <ActionBar title="Melbourne Weather" subtitle="Full Lambda"/>
        </div>
        <div className="main-content">
          <aside className="sidebar">
            <header>
              <h1 className="txt-subheading title-section">Locations</h1>
            </header>
            <LocationList 
              locations={this.props.locations} 
              monitoredLocations={this.props.monitoredLocations}
              onItemClickedObserver={this.props.onLocationsListItemClicked}
            />
          </aside>
          <main className="monitoring-container">
            <header><h1 className="txt-subheading title-section">Monitored location dashboard</h1></header>
            <div className="monitoring-list-container">
              <MonitoringList weatherDataList={this.props.weatherDataList}/>
            </div>
          </main>
        </div>
        <footer className="page-footer">
          <p className="copyright">Melbourne Weather © 2017 David Lei and Patrick Shaw</p>
        </footer>
      </div>
    );
  }
}

class WeatherPageContainer extends React.Component<{}, AppState> {
  private onLocationsListItemClicked: OnLocationItemClickedObserver;
  constructor(props: {}) {
    super(props);
    const initialWeatherData: WeatherLocationData[] = [
      new WeatherLocationData(
        'Location name', 
        new RainfallData('Rainfall', 'Timestamp'), 
        new TemperatureData('Temperature', 'Timestamp')
      ),
      new WeatherLocationData(
        'Location name', 
        new RainfallData('Rainfall', 'Timestamp'), 
        new TemperatureData('Temperature', 'Timestamp')
      ),
      new WeatherLocationData(
        'Location name', 
        new RainfallData('Rainfall', 'Timestamp'), 
        new TemperatureData('Temperature', 'Timestamp')
      ),
      new WeatherLocationData(
        'Location name', 
        new RainfallData('Rainfall', 'Timestamp'), 
        new TemperatureData('Temperature', 'Timestamp')
      ),
      new WeatherLocationData(
        'Location name', 
        new RainfallData('Rainfall', 'Timestamp'), 
        new TemperatureData('Temperature', 'Timestamp')
      ),
      new WeatherLocationData(
        'Location name', 
        new RainfallData('Rainfall', 'Timestamp'), 
        new TemperatureData('Temperature', 'Timestamp')
      )
    ];
    this.state = new AppState([], initialWeatherData, new Set<string>());
  }
  public componentDidMount(): void {
    // Connects to the port that the backend is listening on.
    // Triggers io.on('connection')'s callback
    const socket: SocketIOClient.Socket = SocketIo.connect('http://127.0.0.1:8080');
    console.log('try connect to backend');
    this.onLocationsListItemClicked = new class implements OnLocationItemClickedObserver {
      public onItemClicked(location: string, selected: boolean): void {
        // The backend speaks in MonitorMetadata objects, so create one.
        const monitor: MonitorMetadata = new MonitorMetadata(location);
        if (selected) {
          // We're unselecting a location so emit to remove the monitor
          socket.emit('remove_monitor', monitor);
        } else {
          // We're selecting a location so emit to add the monitor
          socket.emit('add_monitor', monitor);
        }
      }
    }();
    socket.on('locations', (locations: string[]) => {
      // We were given a list of locations. Let React know that we may need to re-render.
      this.setState({ locations });
    });
    socket.on('monitored_locations', (monitoredLocationsList: string[]) => {
      console.log('Retrieved new monitored locations:');
      console.log(monitoredLocationsList);
      // We were given a list of monitored listeners. Turn it into a Set for performance reasons and let
      // React know that we may need to re-render.
      const monitoredLocations: Set<string> = new Set<string>(monitoredLocationsList);
      console.log(monitoredLocations);
      this.setState({ monitoredLocations });
    });
    socket.on('replace_weather_data', (weatherDataList: WeatherLocationData[]) => {
      // We received some fresh weather data.
      // Tell React that we may need to re-render
      const timeStamp: string = new Date().toString();
      console.log('Received weather location data at time: ' + timeStamp);
      console.log(weatherDataList); 
      this.setState({ weatherDataList });
    });
  }
  
  public render(): JSX.Element {
    return (
      <WeatherPage 
        locations={this.state.locations} 
        weatherDataList={this.state.weatherDataList}
        monitoredLocations={this.state.monitoredLocations}
        onLocationsListItemClicked={this.onLocationsListItemClicked}
      />
    );
  }
}

export {WeatherPageContainer as WeatherPage};
export default WeatherPageContainer;
