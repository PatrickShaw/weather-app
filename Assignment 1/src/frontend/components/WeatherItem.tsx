import * as React from 'react';
import {WeatherLocationData} from '../../model/index';
import {ListItem} from './ListItem';
interface WeatherItemProps {
    weather: WeatherLocationData;
}
class WeatherItem extends React.Component<WeatherItemProps, void> {
  constructor() {
    super();
  }
  render() {
    return (
      <ListItem title={this.props.weather.location} subtitle={this.props.weather.rainfallData.rainfall}/>
    );
  }
}
export {WeatherItem};
export default WeatherItem;
