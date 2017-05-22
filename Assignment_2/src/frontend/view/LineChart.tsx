import * as React from 'react';

import * as moment from 'moment';
import * as Chart from 'react-chartjs-2';
import { MonitoredLocationInformation } from '../model/MonitoredLocationInformation';
import './LineChart.scss';

interface LineChartProps {
  monitoredLocationInformation: MonitoredLocationInformation;
}

class LineChart extends React.Component<LineChartProps, void> {
  private createTrendline(
    label: string,
    lineRedValue: number, 
    lineGreenValue: number, 
    lineBlueValue: number, 
    dataPoints: Array<number | null>
  ) {
    const backgroundColor: string = `rgba(${lineRedValue}, ${lineGreenValue}, ${lineBlueValue}, 0.75)`;
    const lineColor: string = `rgb(${lineRedValue}, ${lineGreenValue}, ${lineBlueValue})`;
    return {
      label,
      fill: false,          
      backgroundColor,
      borderColor: lineColor,
      pointBorderColor: lineColor,
      pointBackgroundColor: lineColor,
      data: dataPoints,
    };
  }
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
        const momentResult: moment.Moment = moment(timestamp, 'DD/MM/YYYY H:mm:ss');
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
    
    const data = {
      labels: timestampDataPoints,
      datasets: [ 
        this.createTrendline('Rainfall (mm)', 33, 150, 243, rainfallDataPoints),
        this.createTrendline('Temperature (℃)', 255, 171, 0, temperatureDataPoints)
      ]
    };
    // TODO: Set axis labels, configure graph so looks nicer.
    // TODO: Fine tune dates.
    const options = {
      responsive: true, 
      scales: {
        xAxes: [{
            ticks: {
                autoSkip: true,
                maxRotation: 0,
                minRotation: 0,
                autoSkipPadding: 8
            },
            type: 'time'
          }]
      }
    };
    
    return (
      <div className='chart-container'>
        <Chart.Line 
            data={data}
            options={options}
        />
      </div>
    );
  }
}

export default LineChart;
export {LineChart};
