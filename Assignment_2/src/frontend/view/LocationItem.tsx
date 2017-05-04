import * as React from 'react';

import { GenericListItem } from './GenericListItem';
import { OnLocationItemClickedObserver } from '../observers/OnLocationItemClickedObserver';
import './LocationItem.scss';
interface LocationItemProps {
  location: string;
  rainfallMonitorSelected: boolean;
  temperatureMonitorSelected: boolean;
  onRainfallMonitorClickedObserver?: OnLocationItemClickedObserver;
  onTemperatureMonitorClickedObserver?: OnLocationItemClickedObserver;
}

class LocationItem extends React.Component<LocationItemProps, void> {
  private onRainfallMonitorButtonClickedBound: any;
  private onTemperatureMonitorButtonClickedBound: any;
  constructor(props: LocationItemProps) {
    super(props);
    this.onRainfallMonitorButtonClickedBound = this.onRainfallMonitorButtonClicked.bind(this);
    this.onTemperatureMonitorButtonClickedBound = this.onTemperatureMonitorButtonClicked.bind(this);
  }

  private onRainfallMonitorButtonClicked(
    event: React.MouseEvent<HTMLElement>
  ): void {
    if (this.props.onRainfallMonitorClickedObserver != null) {
      this.props.onRainfallMonitorClickedObserver.onItemClicked(
        this.props.location, 
        this.props.rainfallMonitorSelected
      );
    }
  }

  private onTemperatureMonitorButtonClicked(
    event: React.MouseEvent<HTMLElement>
  ): void {
    if (this.props.onTemperatureMonitorClickedObserver != null) {
      this.props.onTemperatureMonitorClickedObserver.onItemClicked(
        this.props.location, 
        this.props.temperatureMonitorSelected
      );
    }
  }

  public render(): JSX.Element {
    return (
      <div>
        <div className="location-item">
          <GenericListItem title={this.props.location}>
            <button 
              onClick={this.onRainfallMonitorButtonClickedBound} 
              className={this.props.rainfallMonitorSelected ? 'selected' : ''}
            >
              Rain
            </button>
            <button 
              onClick={this.onTemperatureMonitorButtonClickedBound} 
              className={this.props.temperatureMonitorSelected ? 'selected' : ''}
            >
              Temp
            </button>
          </GenericListItem>
        </div>
      </div>
    );
  }
}
export {LocationItem};
export default LocationItem;
