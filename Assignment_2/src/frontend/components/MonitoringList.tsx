import * as React from 'react';
import {WeatherLocationData} from '../../model/WeatherLocationData';
import {MonitoringItem} from './MonitoringItem';
interface MonitoringListProps {
  weatherDataList: WeatherLocationData[];
}
class MonitoringList extends React.Component<MonitoringListProps, void> {
  render() {
    return (
      <section>
        {
          this.props.weatherDataList.map((weatherDataItem: WeatherLocationData) => {
            return <MonitoringItem weatherData={weatherDataItem}/>;
          })
        }
      </section>
    );
  }
}
export {MonitoringList};
export default MonitoringList;
