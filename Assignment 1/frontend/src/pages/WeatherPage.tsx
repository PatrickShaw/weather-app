import * as React from 'react';
import * as Redux from 'redux';
import * as ReactRouter from 'react-router';
import {connect} from 'react-redux';
import {WeatherList} from '../components/WeatherList';
import {WeatherDataItem} from '../model/WeatherDataItem';
import {AppState} from '../model/AppState';
interface StateProps {
    weatherData: Array<WeatherDataItem>;
}
interface DispatchProps {

}
type WeatherPageProps = StateProps & DispatchProps & ReactRouter.RouteComponentProps<{}>;
class WeatherPage extends React.Component<WeatherPageProps, void> {
  render() {
    return (
      <WeatherList weatherData={this.props.weatherData}/>
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