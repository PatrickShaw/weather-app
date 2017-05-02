import * as React from 'react';

import { LocationItem } from './LocationItem';
import { WeatherLocationData } from '../../model/WeatherLocationData';
import { OnLocationItemClickedObserver } from '../observers/OnLocationItemClickedObserver';

interface LocationListProps {
  locations: string[];
  weatherDataMap: Map<string, WeatherLocationData>;
  onItemClickedObserver?: OnLocationItemClickedObserver;
}
class LocationList extends React.Component<LocationListProps, void> {
  public render(): JSX.Element {
    console.log(this.props.locations);
    return (
      <section>
        {
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
                onItemClickedObserver={this.props.onItemClickedObserver}
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
