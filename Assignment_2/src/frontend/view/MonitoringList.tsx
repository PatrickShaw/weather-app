import * as React from 'react';

import { MonitoringItem } from './MonitoringItem';
import { WeatherLocationData } from '../../model/WeatherLocationData';
import './MonitoringList.scss';
interface MonitoringListProps {
  weatherDataMap: Map<string, WeatherLocationData>;
}

class MonitoringList extends React.Component<MonitoringListProps, void> {
  public render(): JSX.Element {  
    console.log('Next is a keys');
    console.log(Object.keys(this.props.weatherDataMap));
    console.log(this.props.weatherDataMap);
    const monitoringElements: JSX.Element[] = [];
    for (const weatherData of this.props.weatherDataMap.values()) {
      monitoringElements.push(
        <div key={weatherData.location} className="card monitoring-item-card">
          <MonitoringItem weatherData={weatherData}/>
        </div>
      );
    }
    return (
      <section className="monitoring-list">
        {
          monitoringElements
        }
      </section>
    );
  }
}
export {MonitoringList};
export default MonitoringList;
