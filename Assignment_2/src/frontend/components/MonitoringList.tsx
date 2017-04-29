import * as React from 'react';

import {MonitoringItem} from './MonitoringItem';
import {WeatherLocationData} from '../../model/WeatherLocationData';

interface MonitoringListProps {
  weatherDataList: WeatherLocationData[];
}

class MonitoringList extends React.Component<MonitoringListProps, void> {
  public render() {
    return (
      <section>
        {
          this.props.weatherDataList.map((weatherDataItem: WeatherLocationData, weatherIndex: number) => {
            return <MonitoringItem key={weatherIndex} weatherData={weatherDataItem}/>;
          })
        }
      </section>
    );
  }
}
export {MonitoringList};
export default MonitoringList;
