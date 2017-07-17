import './MonitoringItem.scss';

import * as React from 'react';

import { LineChart } from './LineChart';
import { MonitoredLocationInformation } from '../model/MonitoredLocationInformation';
import { OnMonitoringItemClickedObserver } from '../observers/OnMonitoringItemClickedObserver';
import { WeatherLocationData } from '../../model/WeatherLocationData';

interface MonitoringItemProps {
  // The weather data that will be used to populate the monitoring item card with information.
  readonly monitoredLocationInformation: MonitoredLocationInformation;
  readonly prefixedLocation: string;
  readonly onGraphToggleClickedObserver: OnMonitoringItemClickedObserver;
}

/**
 * Component that populates a card with weather data information.
 */
class MonitoringItem extends React.Component<MonitoringItemProps, {}> {
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
        `${isFloatingPoint
          ? Math.round(temperatureDataPoint * 100) / 100
          : currentWeatherData.temperatureData.temperature}` +
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
        `${isFloatingPoint ? 
          Math.round(rainfallDataPoint * 100) / 100 :
          currentWeatherData.rainfallData.rainfall}` +
        `${isFloatingPoint ? ' mm' : ''} ` + 
        `(${currentWeatherData.rainfallData.timestamp})`;
    } else {
      rainfallDataToRender = dataMissingMessage;  
    }
   // Keeps track of values tracked.
    // At least 1 timestamp must be valid as only triggered when data (either rainfall or temperature) is fetched.
    // At the very least it will be the most recent entry, later than all other entries in this.timestampDataPoints.
    // Now we're going to specify the markup for the card itself.
    return (
      // TODO <<: Change so relies on monitoredLocationInformation instead of the currentWeatherData.
      <section>
        <section className='worded-measurements'>
          <h1 className='txt-title'>
            {`${this.props.monitoredLocationInformation.location}` + 
             ` (${this.props.monitoredLocationInformation.serviceTitle})`}
          </h1>
          {
            this.props.monitoredLocationInformation.monitorRainfall ? 
            <h2 className='txt-body-1'>
              <strong>Rainfall:</strong> {rainfallDataToRender}
            </h2> : null
          }
          {
            this.props.monitoredLocationInformation.monitorTemperature ? 
            <h2 className='txt-body-1'>
              <strong>Temperature:</strong> {temperatureDataToRender}
            </h2> : null
          }
        </section>
          {
            this.props.monitoredLocationInformation.monitorGraph ?
              <section className='graph-container'>
                <div>
                    <LineChart
                      monitoredLocationInformation={this.props.monitoredLocationInformation}
                    />
                </div> 
              </section>
            : null
          }
        <section className='buttons'>
          <button 
            className='button-margin button-padding ripple' 
            onClick={() => this.props.onGraphToggleClickedObserver(
              this.props.prefixedLocation
            )}
          >
            <i className='material-icons'>
              {
                // The two strings represent the up and down arrows respectively
                this.props.monitoredLocationInformation.monitorGraph ? '\uE5C7' : '\uE5C5'
              }
              </i>Graph 
          </button>
        </section>
      </section>
    );
  }
}
export {MonitoringItem};
export default MonitoringItem;
