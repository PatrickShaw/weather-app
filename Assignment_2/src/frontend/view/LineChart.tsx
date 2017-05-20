import * as React from 'react';

import * as moment from 'moment';
import { Line } from 'react-chartjs-2';
import { MonitoredLocationInformation } from '../model/MonitoredLocationInformation';

interface LineChartProps {
  monitoredLocationInformation: MonitoredLocationInformation;
}

class LineChart extends React.Component<LineChartProps, void> {
  public render(): JSX.Element {
    const rainfallDataPoints: Array<number | null> = [];
    const temperatureDataPoints: Array<number | null> = []; 
    const timestampDataPoints: Date[] = [];
    // Loop for all pieces of weatherData (makes up graph data points).
    for (const weatherData of this.props.monitoredLocationInformation.weatherDataList) {
      let timestamp: string | undefined;

      let rainfallPoint: number | null = null;
      if (this.props.monitoredLocationInformation.monitorRainfall) {        
        // Show rainfall on graph.
        if (weatherData.rainfallData != null && weatherData.rainfallData.rainfall != null) {
          rainfallPoint = parseFloat(weatherData.rainfallData.rainfall);
          if (isNaN(rainfallPoint)) {
            rainfallPoint = null;
          }
          timestamp = weatherData.rainfallData.timestamp;
        }
      }
      rainfallDataPoints.push(rainfallPoint);  // Can be null, if null breaks graph being joint.

      let temperaturePoint: number | null = null;
      if (this.props.monitoredLocationInformation.monitorTemperature) {
        // Show temperature on graph.
        if (weatherData.temperatureData != null && weatherData.temperatureData.temperature != null) {
          temperaturePoint = parseFloat(weatherData.temperatureData.temperature);
          if (isNaN(temperaturePoint)) {
            temperaturePoint = null;
          }
          timestamp = weatherData.temperatureData.timestamp;  
        }
      }
      temperatureDataPoints.push(temperaturePoint);  // Can be null, if null breaks graph being joint.
      
      // Note: Assumed for a single weather data location, if a rainfall or temp is provided then 
      // the timestamp must not be null.
      // Additionally at least one of temp or rainfall data must be provided so getting to here
      // means that timeStamp should not be null.
      if (timestamp != null) {
        // Parse timestamp.
        // String date of form: 24/07/2015 12:58:45
        const momentResult: moment.Moment = moment(timestamp, 'DD/MM/YYYY HH:mm:ss');
        if (momentResult.isValid) {
          const date: Date = momentResult.toDate();
          timestampDataPoints.push(date);
        } else {
          console.error(`Failed to parse ${timestamp}`);
        }
      } else {
        console.error('Timestamp was null.');
      }
    }
    
    // Note: RGBA is reg green blue alpha, alpha is opacity between 0.0 and 1.0, the higher is more solid.
    // 
    const data = {
      labels: timestampDataPoints,
      datasets: [
        {
          label: 'Rainfall',
          fill: false,          
          backgroundColor: 'rgba(33, 150, 243, 0.75)',
          borderColor: 'rgb(33, 150, 243)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgb(33, 150, 243)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 0,
          pointHoverRadius: 3,
          pointHoverBackgroundColor: 'rgb(33, 150, 243)',
          pointHoverBorderColor: 'rgb(33, 150, 243)',
          pointHoverBorderWidth: 1,
          pointRadius: 1,
          pointHitRadius: 5,
          data: rainfallDataPoints
        },
        {
          label: 'Temperature',
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'rgba(255, 171, 0, 0.75)',
          borderColor: 'rgb(255, 171, 0)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgb(255, 171, 0)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 0,
          pointHoverRadius: 3,
          pointHoverBackgroundColor: 'rgb(255, 171, 0)',
          pointHoverBorderColor: 'rgb(255, 171, 0)',
          pointHoverBorderWidth: 1,
          pointRadius: 1,
          pointHitRadius: 5,
          data: temperatureDataPoints
        }
      ]
    };
    // TODO: Set axis labels, configure graph so looks nicer.
    // TODO: Fine tune dates.
    const options = {
      scales: {
        xAxes: [{
            ticks: {
                autoSkip: true,
                maxRotation: 0,
                minRotation: 0,
                autoSkipPadding: 10
            },
            type: 'time',
            displayFormats: {
              day: 'MMM DD'
            }
          }]
      }
    };
    
    return (
      <Line 
          data={data}
          options={options}
      />
    );
  }
}

export default LineChart;
export {LineChart};
