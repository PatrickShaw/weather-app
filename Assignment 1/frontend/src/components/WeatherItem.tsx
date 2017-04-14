import * as React from 'react';
import {WeatherDataItem} from '../model/WeatherDataItem';
import {ListItem} from './ListItem';
interface WeatherItemProps {
    weather: WeatherDataItem;
}
class WeatherItem extends React.Component<WeatherItemProps, void> {
  render() {
    return (
      <ListItem title={this.props.weather.location} subtitle={this.props.weather.rainfall}/>
    );
  }
}
export {WeatherItem};
export default WeatherItem;