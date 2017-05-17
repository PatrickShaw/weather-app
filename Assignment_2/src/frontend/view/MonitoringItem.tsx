import * as React from 'react';

import {LineChart} from './LineChart';
import { WeatherLocationData } from '../../model/WeatherLocationData';
import { MonitoringData } from '../model/MonitoringData';

interface MonitoringItemProps {
  // The weather data that will be used to populate the monitoring item card with information.
  readonly weatherData: MonitoringData;
}

/**
 * Component that populates a card with weather data information.
 */
class MonitoringItem extends React.Component<MonitoringItemProps, void> {

  public render(): JSX.Element {
    // Only called when the weatherData to show has changed.
    // First we're going to figure out what strings to render for contents of the card.
    const dataMissingMessage = 'N/A';
    let temperatureDataToRender: string;
    let rainfallDataToRender: string;
    let temperatureDataPoint: number|null = null;
    let rainfallDataPoint: number|null = null;
    let temperatureTimestamp: string|null = null;
    let rainfallTimestamp: string|null = null;
    const recentWeatherData: WeatherLocationData = this.props.weatherData.weatherDataList[0];
    if (
      this.props.weatherData.monitorTemperature &&
      recentWeatherData.temperatureData != null && 
      recentWeatherData.temperatureData.temperature != null &&
      recentWeatherData.temperatureData.temperature !== ''
    ) {
      temperatureDataPoint = parseFloat(recentWeatherData.temperatureData.temperature);
      temperatureTimestamp = recentWeatherData.temperatureData.timestamp;
      const isFloatingPoint: boolean = !isNaN(temperatureDataPoint);
      temperatureDataToRender = 
        `${recentWeatherData.temperatureData.temperature}` +
        `${isFloatingPoint ? ' ℃' : ''} ` + 
        `(${recentWeatherData.temperatureData.timestamp})`;      
    } else {
      temperatureDataToRender = dataMissingMessage;
    }

    if (
      recentWeatherData.rainfallData != null && 
      recentWeatherData.rainfallData.rainfall != null && 
      recentWeatherData.rainfallData.rainfall !== ''
    ) {
      rainfallDataPoint = parseFloat(recentWeatherData.rainfallData.rainfall);
      rainfallTimestamp = recentWeatherData.rainfallData.timestamp;
      const isFloatingPoint: boolean = !isNaN(rainfallDataPoint);
      rainfallDataToRender = 
        `${recentWeatherData.rainfallData.rainfall}` +
        `${isFloatingPoint ? ' mm' : ''} ` + 
        `(${recentWeatherData.rainfallData.timestamp})`;
    } else {
      rainfallDataToRender = dataMissingMessage;  
    }
    
    // Keeps track of values tracked.
    
    // At least 1 timestamp must be valid as only triggered when data (either rainfall or temperature) is fetched.

    // At the very least it will be the most recent entry, later than all other entries in this.timestampDataPoints.
  
    // Now we're going to specify the markup for the card itself.
    return (
      <section className="pad-item-list">
        <h1 className="txt-body-2">{recentWeatherData.location}</h1>
        {
          recentWeatherData.rainfallData ? 
          <h2 className="txt-body-1">
            Rainfall: {rainfallDataToRender}
          </h2> : null
        }
        {
          recentWeatherData.temperatureData ? 
          <h2 className="txt-body-1">
            Temperature: {temperatureDataToRender}
          </h2> : null
        }
        {
          <div>
              <LineChart
                monitoringData={this.props.weatherData}
              />
          </div>
        }
      </section>
    );
  }
}
export {MonitoringItem};
export default MonitoringItem;
