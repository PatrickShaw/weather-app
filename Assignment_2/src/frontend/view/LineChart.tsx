import * as React from 'react';

import { Line } from 'react-chartjs';

interface LineChartProps {
  readonly location: string;
  // Timestamps:
  // Rainfall info:
  // Temp info
}


class LineChart extends React.Component<LineChartProps, void> {
  constructor(props: LineChartProps) {
    super(props);
  }

  public render(): JSX.Element {
    const dataLabels: string[] = ['apple', 'pear', 'tomato'];
    const dataValues: number[] = [
      100,
      22,
      3
    ];

    const data =  {
      datasets: [
        {
          fillColor: ['rgba(0,10,220,0.5)',
                      'rgba(220,0,10,0.5)',
                      'rgba(220,0,0,0.5)',
                      'rgba(120,250,120,0.5)', 
                      'rgba(120,250,120,0.5)' ],
          strokeColor: 'rgba(220,220,220,0.8)',
          highlightFill: 'rgba(220,220,220,0.75)',
          highlightStroke: 'rgba(220,220,220,1)',
          borderWidth: 1,
          data: dataValues
        },
        {
          fillColor: ['rgba(0,10,220,0.5)',
                      'rgba(220,0,10,0.5)',
                      'rgba(220,0,0,0.5)',
                      'rgba(120,250,120,0.5)', 
                      'rgba(120,250,120,0.5)' ],
          strokeColor: 'rgba(220,220,220,0.8)',
          highlightFill: 'rgba(220,220,220,0.75)',
          highlightStroke: 'rgba(220,220,220,1)',
          borderWidth: 1,
          data: [100, 50, 70]
        }
        

      ],
      labels: dataLabels
    };

    const chartOptions = {
      scales: {
        xAxes: [{
          stacked: true
        }]
      }
    };
   
    return (
      <section className='list-item-container'>
        <div className='weather-page'>
        <Line 
          data={data}
          chartOptions={chartOptions}
              />
        </div>
      </section>
    );
  }
}

export default LineChart;
export {LineChart};
