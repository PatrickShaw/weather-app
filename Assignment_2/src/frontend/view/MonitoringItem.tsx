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
  private temperatureDataPoints: Array<number|null> = [];
  private rainfallDataPoints: Array<number|null> =  [];
  private timestampDataPoints: string[] = [];

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

    if (
      this.props.weatherData.temperatureData != null && 
      this.props.weatherData.temperatureData.temperature != null &&
      this.props.weatherData.temperatureData.temperature !== ''
    ) {
      temperatureDataPoint = parseFloat(this.props.weatherData.temperatureData.temperature);
      temperatureTimestamp = this.props.weatherData.temperatureData.timestamp;
      const isFloatingPoint: boolean = !isNaN(temperatureDataPoint);
      temperatureDataToRender = 
        `${this.props.weatherData.temperatureData.temperature}` +
        `${isFloatingPoint ? ' ℃' : ''} ` + 
        `(${this.props.weatherData.temperatureData.timestamp})`;      
    } else {
      temperatureDataToRender = dataMissingMessage;
    }

    if (
      this.props.weatherData.rainfallData != null && 
      this.props.weatherData.rainfallData.rainfall != null && 
      this.props.weatherData.rainfallData.rainfall !== ''
    ) {
      rainfallDataPoint = parseFloat(this.props.weatherData.rainfallData.rainfall);
      rainfallTimestamp = this.props.weatherData.rainfallData.timestamp;
      const isFloatingPoint: boolean = !isNaN(rainfallDataPoint);
      rainfallDataToRender = 
        `${this.props.weatherData.rainfallData.rainfall}` +
        `${isFloatingPoint ? ' mm' : ''} ` + 
        `(${this.props.weatherData.rainfallData.timestamp})`;
    } else {
      rainfallDataToRender = dataMissingMessage;  
    }
    
    // Keeps track of values tracked.
    
    // At least 1 timestamp must be valid as only triggered when data (either rainfall or temperature) is fetched.
    if (temperatureTimestamp == null) {
      // temperatureTimestamp doesn't exist so use rainfall.
      console.log(`Temperature timestamp is null, using rainfall timestamp: ${rainfallTimestamp}`);
      if (rainfallTimestamp == null) {
        // Will never happen (should not at least) due to domain of problem.
        // Hack to get it to compile.
        console.log('ERROR: Both rainfall and temperature timestamps are null');
        rainfallTimestamp = 'Err';
      }
      this.timestampDataPoints.push(rainfallTimestamp);
      this.rainfallDataPoints.push(rainfallDataPoint);
      this.temperatureDataPoints.push(temperatureDataPoint);
    } else if (rainfallTimestamp == null) {
      // rainfallTimestamp doesn't exist so use temperature.
      console.log(`Rainfall timestamp is null, using temperature timestamp: ${temperatureTimestamp}`);
      this.timestampDataPoints.push(temperatureTimestamp);
      this.rainfallDataPoints.push(rainfallDataPoint);
      this.temperatureDataPoints.push(temperatureDataPoint);
    } else if (temperatureTimestamp === rainfallTimestamp) {
      // Timestamp for rainfall and temperature should be the same.
      console.log(`Temperature timestamp is the same as Rainfall timestamp: ${temperatureTimestamp}`);
      this.timestampDataPoints.push(temperatureTimestamp);
      this.rainfallDataPoints.push(rainfallDataPoint);
      this.temperatureDataPoints.push(temperatureDataPoint);
    } else {
      console.log(`WARN: Temperature timestamp (${temperatureTimestamp}) is the different to 
        Rainfall timestamp (${rainfallTimestamp})`);
      // Need to sort.
    }

    // At the very least it will be the most recent entry, later than all other entries in this.timestampDataPoints.
  
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
                timestampLabels={this.timestampDataPoints}
                temperatureDataPoints={this.temperatureDataPoints}
                rainfallDataPoints={this.rainfallDataPoints}
              />
          </div>
        }
      </section>
    );
  }
}
export {MonitoringItem};
export default MonitoringItem;
