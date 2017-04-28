import * as React from 'react';
import {WeatherLocationData} from '../../model/WeatherLocationData';
interface MonitoringItemProps {
  weatherData: WeatherLocationData;
}
class MonitoringItem extends React.Component<MonitoringItemProps, void> {
  render() {
    return (
      <section>
        <h1>Hello</h1>
        <h2>Weather</h2>
      </section>
    );
  }
}
export {MonitoringItem};
export default MonitoringItem;
