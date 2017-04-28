import * as React from 'react';
import * as ReactRouter from 'react-router';
import * as SocketIo from 'socket.io-client';
import {LocationList} from '../components/LocationList';
import {WeatherLocationData} from '../../model/index';
import {AppState} from '../model/AppState';
import {ActionBar} from '../components/AppBar';
import {MonitoringList} from '../components/MonitoringList';
import './WeatherPage.scss';
import { TemperatureData } from '../../model/TemperatureData';
import { RainfallData } from '../../model/RainfallData';
interface StateProps {
    appState: AppState;
}
type WeatherPageProps = StateProps;
class WeatherPage extends React.Component<WeatherPageProps, void> {
  render() {
    return (
      <div className="weather-page">
        <div className="page-heading">
          <ActionBar title="Melbourne Weather" subtitle="Full Lambda"/>
        </div>
        <aside className="sidebar">
          <header><h1 className="txt-subheading title-section">Locations</h1></header>
          <LocationList locations={['Rawr', 'This', 'Is', 'A', 'Test']}/>
        </aside>
        <main className="monitoring-container">
          <header><h1 className="txt-subheading title-section">Monitored location dashboard</h1></header>
          <MonitoringList weatherDataList={this.props.appState.weatherData}/>
        </main>
        <footer className="page-footer">
          <p className="copyright">Melbourne Weather © 2017 David Lei and Patrick Shaw</p>
        </footer>
      </div>
    );
  }
}
class WeatherPageContainer extends React.Component<ReactRouter.RouteComponentProps<{}>, StateProps> {
  constructor() {
    super();
    const initialState: AppState = new AppState([
        new WeatherLocationData(
          'Frankston',
          new RainfallData('10', '10/06/2016'), 
          new TemperatureData('14', '10/06/2017')),

        new WeatherLocationData(
          'Clayton', 
          new RainfallData('12', '10/06/2016'), 
          new TemperatureData('13', '10/06/2017'))
    ]); 
    this.state = {appState: initialState};
  }
  componentDidMount() {
    // Trigger io.sockets.on('connection')
    const io: SocketIOClient.Socket = SocketIo.connect('http://127.0.0.1:8080');
    const that: WeatherPageContainer = this;
    io.on('update_weather_location_data', function(weatherLocationDataList: Array<WeatherLocationData>) {
        console.log('Recieved weather location data');
        console.log(weatherLocationDataList); 
        that.setState({appState: new AppState(weatherLocationDataList)});
    });
  }
  render() {
    return <WeatherPage appState={this.state.appState}/>;
  }
}


export {WeatherPageContainer as WeatherPage};
export default WeatherPageContainer;
