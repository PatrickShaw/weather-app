import './MonitoringList.css';

import * as React from 'react';

import { LocationMetadata } from '../model/LocationMetadata';
import { MonitoredLocationInformation } from '../model/MonitoredLocationInformation';
import { MonitoringItem } from './MonitoringItem';
import { observer } from 'mobx-react';
interface MonitoringListProps {
  // The list of all locations.
  // We actually use this to keep the weatherDataMap items in alphabetical order when render.
  // This means that the complexity of finding what to render is O(locations.length) instead of 
  // O(weatherDataMap.size) but for this assignment the difference minimal and the optimization is 
  // considered out of scope.
  readonly locations: LocationMetadata[];
  // The map of locations to their associated MonitoredLocationInformation.
  readonly weatherDataMap: Map<string, MonitoredLocationInformation>;
}

/**
 * A simple wrapper that creates a list of MonitorItems from a map of weather data.
 */
const MonitoringList: React.ClassicComponentClass<MonitoringListProps> 
  = observer(({locations, weatherDataMap}: MonitoringListProps) => (
    <section className='monitoring-list'>
      {
        // If a location is in this.props.weatherDataMap then it has information that should be rendered.
        locations.map((locationMetadata) => {
          const prefixedLocations: string[] = Array.from(locationMetadata.prefixedLocations);
          return prefixedLocations.map((prefixedLocation: string) => {
            const monitoredLocationInformation: MonitoredLocationInformation | undefined = 
              weatherDataMap.get(prefixedLocation);
            return (
              monitoredLocationInformation != null
              && (monitoredLocationInformation.getMonitorRainfall() || monitoredLocationInformation.getMonitorTemperature()) 
              && monitoredLocationInformation.weatherDataList.length > 0 
              ? <div key={prefixedLocation}>
                  <div className='card monitoring-item-card'>
                    <MonitoringItem 
                      prefixedLocation={prefixedLocation}
                      monitoredLocationInformation={monitoredLocationInformation}
                    />
                  </div>
                </div>
              : null
            );
          });
        })
      }
    </section>
  ));
export {MonitoringList};
export default MonitoringList;
