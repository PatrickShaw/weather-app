import './MonitoringList.scss';

import * as React from 'react';

import { MonitoredLocationInformation } from '../model/MonitoredLocationInformation';
import { MonitoringItem } from './MonitoringItem';

interface MonitoringListProps {
  // The list of all locations.
  // We actually use this to keep the weatherDataMap items in alphabetical order when render.
  // This means that the complexity of finding what to render is O(locations.length) instead of 
  // O(weatherDataMap.size) but for this assignment the difference minimal and the optimization is 
  // considered out of scope.
  readonly locations: string[];
  // The map of locations to their associated MonitoredLocationInformation.
  readonly weatherDataMap: Map<string, MonitoredLocationInformation>;
}

/**
 * A simple wrapper that creates a list of MonitorItems from a map of weather data.
 */
class MonitoringList extends React.Component<MonitoringListProps, void> {
  public render(): JSX.Element {  
    // console.log(Object.keys(this.props.weatherDataMap));
    // console.log(this.props.weatherDataMap);
    return (
      <section className="monitoring-list">
        {
          this.props.locations.map((location, locationIndex) => {
            const weatherData: MonitoredLocationInformation | undefined = this.props.weatherDataMap.get(location);
            return (
              weatherData && weatherData.weatherDataList.length > 0 ?
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
