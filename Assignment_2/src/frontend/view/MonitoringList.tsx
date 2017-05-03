import * as React from 'react';

import { MonitoringItem } from './MonitoringItem';
import { WeatherLocationData } from '../../model/WeatherLocationData';
import './MonitoringList.scss';
interface MonitoringListProps {
  locations: string[];
  weatherDataMap: Map<string, WeatherLocationData>;
}

class MonitoringList extends React.Component<MonitoringListProps, void> {
  public render(): JSX.Element {  
    console.log(Object.keys(this.props.weatherDataMap));
    console.log(this.props.weatherDataMap);
    return (
      <section className="monitoring-list">
        {
          this.props.locations.map((location, locationIndex) => {
            const weatherData: WeatherLocationData | undefined = this.props.weatherDataMap.get(location);
            return (
              weatherData ?
              <div key={location} className="card monitoring-item-card">
                <MonitoringItem weatherData={weatherData}/>
              </div>
              : null
            );
          })
        }
      </section>
    );
  }
}
export {MonitoringList};
export default MonitoringList;
