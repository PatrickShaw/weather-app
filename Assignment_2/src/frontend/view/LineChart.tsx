import * as React from 'react';

import { Line } from 'react-chartjs';

interface LineChartProps {
  // Datapassed in.
  timestampLabels: string[];
  temperatureDataPoints: Array<number|null>;
  rainfallDataPoints: Array<number|null>;
}


class LineChart extends React.Component<LineChartProps, void> {

  public render(): JSX.Element {
    // Note: RGBA is reg green blue alpha, alpha is opacity between 0.0 and 1.0, the higher is more solid.
    
    console.log('Chart values ----');
    console.log(this.props.timestampLabels);
    console.log(this.props.rainfallDataPoints);
    console.log(this.props.temperatureDataPoints);
    const data = {
      labels: this.props.timestampLabels,
      datasets: [
        {
          label: 'Rainfall',
          fillColor: 'rgba(0,0,0,0)',
          strokeColor: 'rgba(0,0,255,1)',
          data: this.props.rainfallDataPoints
        },
        {
          label: 'Temperature',
          fillColor: 'rgba(0,0,0,0)',
          strokeColor: 'rgba(255,0,0,1)',
          data: this.props.temperatureDataPoints
        }
      ]
    };

    // const chartOptions = {
    // };
   
    return (
      <Line 
        data={data}
        // chartOptions={chartOptions}
      />
    );
  }
}

export default LineChart;
export {LineChart};
