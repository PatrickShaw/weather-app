import * as React from 'react';

import { LocationItem } from './LocationItem';

interface LocationListProps {
  locations: string[];
}
class LocationList extends React.Component<LocationListProps, void> {

  constructor() {
    super();
  }

  public render() {
    return (
      <section>
        {
          this.props.locations.map((location, locationIndex) => {
            return <LocationItem key={locationIndex} location={location}/>;
          })
        }
      </section>
    );
  }
}
export {LocationList};
export default LocationList;
