import './WeatherPage.scss';

import * as React from 'react';
import * as ReactRouter from 'react-router';
import * as SocketIo from 'socket.io-client';

import {ActionBar} from '../components/AppBar';
import {AppState} from '../model/AppState';
import {LocationList} from '../components/LocationList';
import {MonitoringList} from '../components/MonitoringList';
import {WeatherLocationData} from '../../model/WeatherLocationData';

type WeatherPageProps = AppState;

class WeatherPage extends React.Component<WeatherPageProps, void> {
  public render(): JSX.Element {
    return (
      <div className="weather-page">
        <div className="page-heading">
          <ActionBar title="Melbourne Weather" subtitle="Full Lambda"/>
        </div>
        <aside className="sidebar">
          <header><h1 className="txt-subheading title-section">Locations</h1></header>
          <LocationList locations={this.props.locations}/>
        </aside>
        <main className="monitoring-container">
          <header><h1 className="txt-subheading title-section">Monitored location dashboard</h1></header>
          <MonitoringList weatherDataList={this.props.weatherDataList}/>
        </main>
        <footer className="page-footer">
          <p className="copyright">Melbourne Weather © 2017 David Lei and Patrick Shaw</p>
        </footer>
      </div>
    );
  }
}

class WeatherPageContainer extends React.Component<ReactRouter.RouteComponentProps<{}>, AppState> {
  constructor() {
    super();
    this.state = new AppState([], []);
  }
  public componentDidMount(): void {
    // Trigger io.sockets.on('connection') to http://127.0.0.1:8080.
    const io: SocketIOClient.Socket = SocketIo.connect('http://127.0.0.1:8080');
    const that: WeatherPageContainer = this;
    io.on('locations', (locations: string[]) => {
      that.setState({ locations });
    });
    io.on('weather_data', (weatherDataList: WeatherLocationData[]) => {
      const timeStamp: string = new Date().toString();
      console.log('Received weather location data at time: ' + timeStamp);
      console.log(weatherDataList); 
      that.setState({ weatherDataList });
    });
  }
  
  public render(): JSX.Element {
    return <WeatherPage locations={this.state.locations} weatherDataList={this.state.weatherDataList}/>;
  }
}

export {WeatherPageContainer as WeatherPage};
export default WeatherPageContainer;
