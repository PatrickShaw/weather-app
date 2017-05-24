import * as React from 'react';
import { LocationMetadata } from '../model/LocationMetadata';
import { LocationItem } from './LocationItem';
import { MonitoredLocationInformation } from '../model/MonitoredLocationInformation';
import { OnLocationItemClickedObserver } from '../observers/OnLocationItemClickedObserver';

interface LocationListProps {
  // A list of all locations.
  readonly locations: LocationMetadata[];
  // A map of locations to their associated weather data.
  readonly weatherDataMap: Map<string, MonitoredLocationInformation>;
  // An observer that specifies what happens when a rainfall monitor button is clicked.
  readonly onRainfallItemClickedObserver?: OnLocationItemClickedObserver;
  // An observer that specifies what happens when a temperature monitor button is clicked.
  readonly onTemperatureItemClickedObserver?: OnLocationItemClickedObserver;
}

/**
 * A simple list wrapper that populates a list with LocationItems according to a map of weather data.
 * Takes in OnLocationItemClickedObserver from parent component.
 */
class LocationList extends React.Component<LocationListProps, void> {
  public render(): JSX.Element {
    return (
      <section>
        {
          // Go through each item in the map and create a LocationItem html markup from it.
          this.props.locations.map((locationMetadata: LocationMetadata, locationIndex) => {
            const prefixedLocations: string[] = Array.from(locationMetadata.prefixedLocations);
            return prefixedLocations.map((prefixedLocation: string) => {
              const weatherData: MonitoredLocationInformation | undefined 
                = this.props.weatherDataMap.get(prefixedLocation);
              if (weatherData == null) {
                return null;
              }
              let rainfallSelected: boolean = false;
              let temperatureSelected: boolean = false;
              if (weatherData) {
                if (weatherData.monitorRainfall) {
                  rainfallSelected = true;
                }
                if (weatherData.monitorTemperature) {
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
                  onRainfallMonitorClickedObserver={this.props.onRainfallItemClickedObserver}
                  onTemperatureMonitorClickedObserver={this.props.onTemperatureItemClickedObserver}
                />
              );
            });
          })
        }
      </section>
    );
  }
}
export {LocationList};
export default LocationList;
