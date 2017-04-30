import * as React from 'react';

import { LocationItem } from './LocationItem';
import { OnLocationItemClickedObserver } from '../observers/OnLocationItemClickedObserver';

interface LocationListProps {
  locations: string[];
  monitoredLocations: Set<string>;
  onItemClickedObserver?: OnLocationItemClickedObserver;
}
class LocationList extends React.Component<LocationListProps, void> {
  public render(): JSX.Element {
    return (
      <section>
        {
          this.props.locations.map((location, locationIndex) => {
            return ( 
              <LocationItem 
                key={locationIndex} 
                location={location} 
                selected={this.props.monitoredLocations.has(location)}
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
