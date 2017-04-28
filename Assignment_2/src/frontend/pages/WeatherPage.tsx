import * as React from 'react';
import * as Redux from 'redux';
import * as ReactRouter from 'react-router';
import {connect} from 'react-redux';
import {WeatherList} from '../components/WeatherList';
import {WeatherLocationData} from '../../model/index';
import {AppState} from '../model/AppState';
import {ActionBar} from '../components/AppBar';
import {MonitoringList} from '../components/MonitoringList';
import './WeatherPage.scss';
interface StateProps {
    weatherData: Array<WeatherLocationData>;
}
interface DispatchProps {

}
type WeatherPageProps = StateProps & DispatchProps & ReactRouter.RouteComponentProps<{}>;
class WeatherPage extends React.Component<WeatherPageProps, void> {
  render() {
    return (
      <div className="weather-page">
        <div className="page-heading">
          <ActionBar title="Melbourne Weather" subtitle="Full Lambda"/>
        </div>
        <aside className="sidebar">
          <header><h1 className="txt-subheading title-section">Locations</h1></header>
          <WeatherList weatherData={this.props.weatherData}/>
        </aside>
        <main className="monitoring-container">
          <header><h1 className="txt-subheading title-section">Monitored location dashboard</h1></header>
          <MonitoringList weatherDataList={this.props.weatherData}/>
        </main>
        <footer className="page-footer">
          <p className="copyright">Melbourne Weather © 2017 David Lei and Patrick Shaw</p>
        </footer>
      </div>
    );
  }
}
function mapStateToProps(state: AppState, ownProps: WeatherPageProps): StateProps {
  return {
    weatherData: state.weatherData
  };
}
function mapDispatchToProps(dispatch: Redux.Dispatch<DispatchProps>, ownProps: WeatherPageProps): DispatchProps {
  return {
    
  };
}
const ConnectedWeatherPage = connect(mapStateToProps, mapDispatchToProps)(WeatherPage);
export {ConnectedWeatherPage as WeatherPage};
export default ConnectedWeatherPage;
