import * as React from 'react';
import {WeatherLocationData} from '../../model/WeatherLocationData';
interface MonitoringItemProps {
  weatherData: WeatherLocationData;
}
class MonitoringItem extends React.Component<MonitoringItemProps, void> {
  render() {
    return (
      <section className="pad-item-list">
        <h1 className="txt-body-2">Hello</h1>
        <h2 className="txt-body-1">Weather</h2>
      </section>
    );
  }
}
export {MonitoringItem};
export default MonitoringItem;
