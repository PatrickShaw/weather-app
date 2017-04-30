import * as React from 'react';

import { GenericListItem } from './GenericListItem';
import { OnClickObserver } from '../observers/OnClickObserver';
import { OnLocationItemClickedObserver } from '../observers/OnLocationItemClickedObserver';
interface LocationItemProps {
  location: string;
  selected?: boolean;
  onItemClickedObserver?: OnLocationItemClickedObserver;
}

class LocationItem extends React.Component<LocationItemProps, void> {
  private onClickObserver: OnClickObserver;
  constructor(props: LocationItemProps) {
    super(props);
    const that: LocationItem = this;
    this.onClickObserver = new class implements OnClickObserver {
      public onClick(): void {
        that.onItemClicked();
        console.log("FUCK YEAH");
      }
    }();
  }

  public render(): JSX.Element {
    return (
      <div className={this.props.selected ? 'ripple selected' : 'ripple'}>
        <GenericListItem title={this.props.location} onClickObserver={this.onClickObserver}/>
      </div>
    );
  }

  private onItemClicked(): void {
    const selected: boolean | undefined = this.props.selected;
        console.log(" no");
    if (this.props.onItemClickedObserver) {
        console.log(" YEAH");
      this.props.onItemClickedObserver.onItemClicked(
        this.props.location, 
        selected ? true : false
      );
    }
  }
}
export {LocationItem};
export default LocationItem;
