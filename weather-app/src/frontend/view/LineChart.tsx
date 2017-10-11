import './LineChart.css';
import { observer } from 'mobx-react';

import * as Chart from 'react-chartjs-2';
import * as React from 'react';
import * as moment from 'moment';

import { MonitoredLocationInformation } from '../model/MonitoredLocationInformation';

interface LineChartProps {
  readonly monitoredLocationInformation: MonitoredLocationInformation;
}
@observer
class LineChart extends React.Component<LineChartProps, {}> {
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
      pointBorderWidth: 1,
      pointRadius: 2,
      pointHitRadius: 10
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
      if (this.props.monitoredLocationInformation.getMonitorRainfall()) {        
        // Show rainfall on graph.
        if (weatherData.rainfallData != null && weatherData.rainfallData.rainfall != null) {
          rainfallPoint = parseFloat(weatherData.rainfallData.rainfall);
          rainfallPoint = isNaN(rainfallPoint) ? null : Math.round(rainfallPoint * 100) / 100;
          timestamp = weatherData.rainfallData.timestamp;
        }
      }

      let temperaturePoint: number | null = null;
      if (this.props.monitoredLocationInformation.getMonitorTemperature()) {
        // Show temperature on graph.
        if (weatherData.temperatureData != null && weatherData.temperatureData.temperature != null) {
          temperaturePoint = parseFloat(weatherData.temperatureData.temperature);
          temperaturePoint = isNaN(temperaturePoint) ? null : Math.round(temperaturePoint * 100) / 100;
          timestamp = weatherData.temperatureData.timestamp;  
        }
      }
      
      // Note: Assumed for a single weather data location, if a rainfall or temp is provided then 
      // the timestamp must not be null.
      // Additionally at least one of temp or rainfall data must be provided so getting to here
      // means that timeStamp should not be null.
      if (timestamp != null) {
        // Parse timestamp.
        // String date of form: 24/07/2015 12:58:45
        const momentResult: moment.Moment = moment(timestamp, 'DD/MM/YYYY H:mm:ss');
        if (momentResult.isValid) {
          // Note that we only add the rainfall and temperature points if we have a corresponding 
          // timestamp. Otherwise the chart won't know where to put the data point.
          // Can be null, if null breaks graph being joint.
          rainfallDataPoints.push(rainfallPoint);  
          // Can be null, if null breaks graph being joint.
          temperatureDataPoints.push(temperaturePoint);  
          const date: Date = momentResult.toDate();
          timestampDataPoints.push(date);
        } else {
          console.error(`Failed to parse ${timestamp}`);
        }
      } else {
        console.error('Timestamp was null.');
      }
    }
    const datasets: Array<{}> = [];
    if (this.props.monitoredLocationInformation.getMonitorTemperature()) {
      datasets.push(this.createTrendline('Temperature (℃)', 255, 171, 0, temperatureDataPoints));
    }
    if (this.props.monitoredLocationInformation.getMonitorRainfall()) {
      datasets.push(this.createTrendline('Rainfall (mm)', 33, 150, 243, rainfallDataPoints));
    }
    const data = {
      labels: timestampDataPoints,
      datasets
    };
    // TODO: Set axis labels, configure graph so looks nicer.
    // TODO: Fine tune dates.
    const options = {
      responsive: true, 
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
            ticks: {
                autoSkip: true,
                maxRotation: 0,
                minRotation: 0,
                autoSkipPadding: 8,
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
