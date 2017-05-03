import * as React from 'react';

import { WeatherLocationData } from '../../model/WeatherLocationData';

interface MonitoringItemProps {
  weatherData: WeatherLocationData;
}
class MonitoringItem extends React.Component<MonitoringItemProps, void> {
  public render(): JSX.Element {

    let temperatureDataToRender: string = 'N/A';
    if (this.props.weatherData.temperatureData) {
      // Don't render ℃ with N/A.
      if (this.props.weatherData.temperatureData.temperature !== 'N/A') {
        temperatureDataToRender = this.props.weatherData.temperatureData.temperature + ' ℃';
      }
    }

    let rainfallDataToRender: string = 'N/A';
    if (this.props.weatherData.rainfallData) {
      if (this.props.weatherData.rainfallData.rainfall !== 'N/A') {
        rainfallDataToRender = this.props.weatherData.rainfallData.rainfall + ' mm';
      }
    }
    const dataMissingMessage = 'N/A';
    return (
      <section className="pad-item-list">
        <h1 className="txt-body-2">{this.props.weatherData.location}</h1>
        {
          this.props.weatherData.rainfallData ? 
          <h2 className="txt-body-1">
            Rainfall: {rainfallDataToRender == null ? dataMissingMessage : rainfallDataToRender}
          </h2> : null
        }
        {
          this.props.weatherData.temperatureData ? 
          <h2 className="txt-body-1">
            Temperature: {temperatureDataToRender == null ? dataMissingMessage : temperatureDataToRender}
          </h2> : null
        }
      </section>
    );
  }
}
export {MonitoringItem};
export default MonitoringItem;
