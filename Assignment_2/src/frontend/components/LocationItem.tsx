import * as React from 'react';

import { GenericListItem } from './GenericListItem';

interface LocationItemProps {
  location: string;
}

class LocationItem extends React.Component<LocationItemProps, void> {
  constructor() {
    super();
  }
  public render() {
    return (
      <GenericListItem title={this.props.location}/>
    );
  }
}
export {LocationItem};
export default LocationItem;
