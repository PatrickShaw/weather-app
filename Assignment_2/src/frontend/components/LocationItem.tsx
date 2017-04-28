import * as React from 'react';
import {WeatherLocationData} from '../../model/index';
import {ListItem} from './ListItem';
interface LocationItemProps {
    location: string;
}
class WeatherItem extends React.Component<LocationItemProps, void> {
  constructor() {
    super();
  }
  render() {
    return (
      <ListItem title={this.props.location} subtitle={this.props.weather.rainfallData.rainfall}/>
    );
  }
}
export {WeatherItem};
export default WeatherItem;
