import * as React from 'react';

import { GenericListItem } from './GenericListItem';
import { OnClickObserver } from '../observers/OnClickObserver';
import { OnLocationItemClickedObserver } from '../observers/OnLocationItemClickedObserver';

interface LocationItemProps {
  location: string;
  rainfallMonitorSelected: boolean;
  temperatureMonitorSelected: boolean;
  onRainfallMonitorClickedObserver?: OnLocationItemClickedObserver;
  onTemperatureMonitorClickedObserver?: OnLocationItemClickedObserver;
}

class LocationItem extends React.Component<LocationItemProps, void> {
  private readonly onRainfallItemClickObserver: OnClickObserver;
  private readonly onTemperatureItemClickObserver: OnClickObserver;
  constructor(props: LocationItemProps) {
    super(props);
    const that: LocationItem = this;
    this.onRainfallItemClickObserver = new class implements OnClickObserver {
      public onClick(): void {
        that.onItemClicked(that.props.onRainfallMonitorClickedObserver, that.props.rainfallMonitorSelected);
      }
    }();
    this.onTemperatureItemClickObserver = new class implements OnClickObserver {
      public onClick(): void {
        that.onItemClicked(that.props.onTemperatureMonitorClickedObserver, that.props.temperatureMonitorSelected);
      }
    }();
  }

  public render(): JSX.Element {
    return (
      <div >
        <div className="ripple">
          <GenericListItem title={this.props.location}/>
        </div>
        <div className="monitor-options">
          <div className={this.props.rainfallMonitorSelected ? 'ripple' : 'ripple scrim'}>
            <GenericListItem 
              onClickObserver={this.onRainfallItemClickObserver}
              title={this.props.rainfallMonitorSelected ? 'Remove rainfall monitor' : 'Add rainfall monitor'}
            />
          </div>
          <div className={this.props.temperatureMonitorSelected ? 'ripple' : 'ripple scrim'}>
            <GenericListItem 
              onClickObserver={this.onTemperatureItemClickObserver}
              title={this.props.temperatureMonitorSelected ? 'Remove temperature monitor' : 'Add temperature monitor'}
            />
          </div>
        </div>
      </div>
    );
  }

  private onItemClicked(onLocationListener?: OnLocationItemClickedObserver, selected?: boolean): void {
    if (onLocationListener) {
      onLocationListener.onItemClicked(
        this.props.location, 
        selected ? true : false
      );
    }
  }
}
export {LocationItem};
export default LocationItem;
