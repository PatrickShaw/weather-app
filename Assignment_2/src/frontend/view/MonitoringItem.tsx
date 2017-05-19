import * as React from 'react';

import {LineChart} from './LineChart';
import { MonitoredLocationInformation } from '../model/MonitoredLocationInformation';
import { WeatherLocationData } from '../../model/WeatherLocationData';

interface MonitoringItemProps {
  // The weather data that will be used to populate the monitoring item card with information.
  readonly monitoredLocationInformation: MonitoredLocationInformation;
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
    const currentWeatherData: WeatherLocationData = this.props.monitoredLocationInformation.weatherDataList[
      this.props.monitoredLocationInformation.weatherDataList.length - 1];
      
    if (
      this.props.monitoredLocationInformation.monitorTemperature &&
      currentWeatherData.temperatureData != null && 
      currentWeatherData.temperatureData.temperature != null &&
      currentWeatherData.temperatureData.temperature !== ''
    ) {
      temperatureDataPoint = parseFloat(currentWeatherData.temperatureData.temperature);
      temperatureTimestamp = currentWeatherData.temperatureData.timestamp;
      const isFloatingPoint: boolean = !isNaN(temperatureDataPoint);
      temperatureDataToRender = 
        `${currentWeatherData.temperatureData.temperature}` +
        `${isFloatingPoint ? ' ℃' : ''} ` + 
        `(${currentWeatherData.temperatureData.timestamp})`;      
    } else {
      temperatureDataToRender = dataMissingMessage;
    }

    if (
      currentWeatherData.rainfallData != null && 
      currentWeatherData.rainfallData.rainfall != null && 
      currentWeatherData.rainfallData.rainfall !== ''
    ) {
      rainfallDataPoint = parseFloat(currentWeatherData.rainfallData.rainfall);
      rainfallTimestamp = currentWeatherData.rainfallData.timestamp;
      const isFloatingPoint: boolean = !isNaN(rainfallDataPoint);
      rainfallDataToRender = 
        `${currentWeatherData.rainfallData.rainfall}` +
        `${isFloatingPoint ? ' mm' : ''} ` + 
        `(${currentWeatherData.rainfallData.timestamp})`;
    } else {
      rainfallDataToRender = dataMissingMessage;  
    }

    console.log('Should show rainfall data: ' + currentWeatherData.rainfallData);
    console.log('Should show temperature data: ' + currentWeatherData.temperatureData);

    // Keeps track of values tracked.
    // At least 1 timestamp must be valid as only triggered when data (either rainfall or temperature) is fetched.
    // At the very least it will be the most recent entry, later than all other entries in this.timestampDataPoints.
    // Now we're going to specify the markup for the card itself.
    return (
      // TODO <<: Change so relies on monitoredLocationInformation instead of the currentWeatherData.
      <section className="pad-item-list">
        <h1 className="txt-body-2">{currentWeatherData.location}</h1>
        {
          this.props.monitoredLocationInformation.monitorRainfall ? 
          <h2 className="txt-body-1">
            Rainfall: {rainfallDataToRender}
          </h2> : null
        }
        {
          this.props.monitoredLocationInformation.monitorTemperature ? 
          <h2 className="txt-body-1">
            Temperature: {temperatureDataToRender}
          </h2> : null
        }
        {
          <div>
            <br/>
            <br/>
              <LineChart
                monitoredLocationInformation={this.props.monitoredLocationInformation}
              />
          </div>
        }
      </section>
    );
  }
}
export {MonitoringItem};
export default MonitoringItem;
