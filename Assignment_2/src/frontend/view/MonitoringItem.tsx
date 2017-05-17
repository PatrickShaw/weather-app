import * as React from 'react';

import {LineChart} from './LineChart';
import { WeatherLocationData } from '../../model/WeatherLocationData';

interface MonitoringItemProps {
  // The weather data that will be used to populate the monitoring item card with information.
  readonly weatherData: WeatherLocationData;
}

/**
 * Component that populates a card with weather data information.
 */
class MonitoringItem extends React.Component<MonitoringItemProps, void> {
  public render(): JSX.Element {
    // First we're going to figure out what strings to render for contents of the card.
    const dataMissingMessage = 'N/A';
    let temperatureDataToRender: string;
    if (
      this.props.weatherData.temperatureData != null && 
      this.props.weatherData.temperatureData.temperature != null &&
      this.props.weatherData.temperatureData.temperature !== ''
    ) {
      const isFloatingPoint: boolean = !isNaN(parseFloat(this.props.weatherData.temperatureData.temperature));
      temperatureDataToRender = 
        `${this.props.weatherData.temperatureData.temperature}` +
        `${isFloatingPoint ? ' ℃' : ''} ` + 
        `(${this.props.weatherData.temperatureData.timestamp})`;
    } else {
      temperatureDataToRender = dataMissingMessage;
    }
    let rainfallDataToRender: string;
    if (
      this.props.weatherData.rainfallData != null && 
      this.props.weatherData.rainfallData.rainfall != null && 
      this.props.weatherData.rainfallData.rainfall !== ''
    ) {
      const isFloatingPoint: boolean = !isNaN(parseFloat(this.props.weatherData.rainfallData.rainfall));
      rainfallDataToRender = 
        `${this.props.weatherData.rainfallData.rainfall}` +
        `${isFloatingPoint ? ' mm' : ''} ` + 
        `(${this.props.weatherData.rainfallData.timestamp})`;
    } else {
      rainfallDataToRender = dataMissingMessage;  
    }
    // Now we're going to specify the markup for the card itself.
    return (
      <section className="pad-item-list">
        <h1 className="txt-body-2">{this.props.weatherData.location}</h1>
        {
          this.props.weatherData.rainfallData ? 
          <h2 className="txt-body-1">
            Rainfall: {rainfallDataToRender}
          </h2> : null
        }
        {
          this.props.weatherData.temperatureData ? 
          <h2 className="txt-body-1">
            Temperature: {temperatureDataToRender}
          </h2> : null
        }
        {
          <div>
              <LineChart
              location={'test'}
              />
          </div>
        }
      </section>
    );
  }
}
export {MonitoringItem};
export default MonitoringItem;
