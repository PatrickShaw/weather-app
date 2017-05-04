import * as React from 'react';

import { LocationItem } from './LocationItem';
import { WeatherLocationData } from '../../model/WeatherLocationData';
import { OnLocationItemClickedObserver } from '../observers/OnLocationItemClickedObserver';

interface LocationListProps {
  // A list of all locations.
  locations: string[];
  // A map of locations to their associated weather data.
  weatherDataMap: Map<string, WeatherLocationData>;
  // An observer that specifies what happens when a rainfall monitor button is clicked.
  onRainfallItemClickedObserver?: OnLocationItemClickedObserver;
  // An observer that specifies what happens when a temperature monitor button is clicked.
  onTemperatureItemClickedObserver?: OnLocationItemClickedObserver;
}
/**
 * A simple list wrapper that populates a list with LocationItems according to a map of weather data.
 */
class LocationList extends React.Component<LocationListProps, void> {
  public render(): JSX.Element {
    return (
      <section>
        {
          // Go through each item in the map and create a LocationItem html markup from it.
          this.props.locations.map((location, locationIndex) => {
            const weatherData: WeatherLocationData | undefined = this.props.weatherDataMap.get(location);
            let rainfallSelected: boolean = false;
            let temperatureSelected: boolean = false;
            if (weatherData) {
              if (weatherData.rainfallData) {
                rainfallSelected = true;
              }
              if (weatherData.temperatureData) {
                temperatureSelected = true;
              }
            }
            return ( 
              <LocationItem 
                key={locationIndex} 
                location={location}   
                rainfallMonitorSelected={rainfallSelected}
                temperatureMonitorSelected={temperatureSelected}
                onRainfallMonitorClickedObserver={this.props.onRainfallItemClickedObserver}
                onTemperatureMonitorClickedObserver={this.props.onTemperatureItemClickedObserver}
              />
            );
          })
        }
      </section>
    );
  }
}
export {LocationList};
export default LocationList;
