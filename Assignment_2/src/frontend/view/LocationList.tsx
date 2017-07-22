import * as React from 'react';
import { observer } from 'mobx-react';

import { LocationItem } from './LocationItem';
import { LocationMetadata } from '../model/LocationMetadata';
import { MonitoredLocationInformation } from '../model/MonitoredLocationInformation';

interface LocationListProps {
  // A list of all locations.
  readonly locations: LocationMetadata[];
  // A map of locations to their associated weather data.
  readonly weatherDataMap: Map<string, MonitoredLocationInformation>;
}

/**
 * A simple list wrapper that populates a list with LocationItems according to a map of weather data.
 * Takes in OnLocationItemClickedObserver from parent component.
 */
const LocationList: React.ClassicComponentClass<LocationListProps> = observer(({ 
  locations, 
  weatherDataMap
}: LocationListProps) => (
  <section>
    {
      // Go through each item in the map and create a LocationItem html markup from it.
      locations.map((locationMetadata: LocationMetadata, locationIndex) => {
        const prefixedLocations: string[] = Array.from(locationMetadata.prefixedLocations);
        return prefixedLocations.map((prefixedLocation: string) => {
          const weatherData: MonitoredLocationInformation | undefined 
            = weatherDataMap.get(prefixedLocation);
          if (weatherData == null) {
            return null;
          }
          let rainfallSelected: boolean = false;
          let temperatureSelected: boolean = false;
          if (weatherData) {
            if (weatherData.getMonitorRainfall()) {
              rainfallSelected = true;
            }
            if (weatherData.getMonitorTemperature()) {
              temperatureSelected = true;
            }
          }
          return ( 
            <LocationItem 
              key={prefixedLocation} 
              location={weatherData.location}
              serviceTitle={weatherData.serviceTitle}
              prefixedLocation={prefixedLocation}
              rainfallMonitorSelected={rainfallSelected}
              temperatureMonitorSelected={temperatureSelected}
            />
          );
        });
      })
    }
  </section>  
));
export {LocationList};
export default LocationList;
