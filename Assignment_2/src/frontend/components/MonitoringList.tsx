import * as React from 'react';

import { MonitoringItem } from './MonitoringItem';
import { WeatherLocationData } from '../../model/WeatherLocationData';
import './MonitoringList.scss';
interface MonitoringListProps {
  weatherDataList: WeatherLocationData[];
}

class MonitoringList extends React.Component<MonitoringListProps, void> {
  public render(): JSX.Element {
    return (
      <section className="monitoring-list">
        {
          this.props.weatherDataList.map((weatherDataItem: WeatherLocationData, weatherIndex: number) => {
            return (
              <div key={weatherIndex} className="card monitoring-item-card">
                <MonitoringItem weatherData={weatherDataItem}/>
              </div>
            );
          })
        }
      </section>
    );
  }
}
export {MonitoringList};
export default MonitoringList;
