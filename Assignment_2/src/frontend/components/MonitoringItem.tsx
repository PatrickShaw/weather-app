import * as React from 'react';

import { WeatherLocationData } from '../../model/WeatherLocationData';

interface MonitoringItemProps {
  weatherData: WeatherLocationData;
  
}

class MonitoringItem extends React.Component<MonitoringItemProps, void> {
  public render() {
    console.log('debug: ');
    console.log(this.props.weatherData.getLocation());

    return (
      <section className="pad-item-list">
        <h1 className="txt-body-2">{this.props.weatherData.getLocation()}</h1>
        <h2 className="txt-body-1">{this.props.weatherData.getRainfallData().getRainfall()}</h2>
        <h2 className="txt-body-1">{this.props.weatherData.getTemperatureData().getTemperature()}</h2>
      </section>
    );
  }
}
export {MonitoringItem};
export default MonitoringItem;
