import * as React from 'react';
import {WeatherLocationData} from '../../model/index';
import {GenericListItem} from './GenericListItem';
interface WeatherItemProps {
    weather: WeatherLocationData;
}
class WeatherItem extends React.Component<WeatherItemProps, void> {
  constructor() {
    super();
  }
  render() {
    return (
      <GenericListItem title={this.props.weather.location} subtitle={this.props.weather.rainfallData.rainfall}/>
    );
  }
}
export {WeatherItem};
export default WeatherItem;
