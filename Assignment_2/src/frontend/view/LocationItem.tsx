import * as React from 'react';

import { GenericListItem } from './GenericListItem';
import { OnLocationItemClickedObserver } from '../observers/OnLocationItemClickedObserver';
import './LocationItem.scss';
interface LocationItemProps {
  // The location associated with the LocationItem
  location: string;
  // Whether the rainfall monitor has been selected for this item.
  rainfallMonitorSelected: boolean; 
  // Whether the temperature monitor ahs been selected for this item.
  temperatureMonitorSelected: boolean; 
  // Specifies what happens when the rainfall monitor button is clicked.
  onRainfallMonitorClickedObserver?: OnLocationItemClickedObserver;
  // Specifies what happens when the temperature monitor button is clicked.
  onTemperatureMonitorClickedObserver?: OnLocationItemClickedObserver;
}

/**
 * A list item that specifically handles a side bar location item.
 * Contains listeners for when inner rain and temperature monitor buttons are clicked.
 */
class LocationItem extends React.Component<LocationItemProps, void> {
  // The bound versions of the original click methods.
  // Unfortunately Typescript doesn't specify the types for these bound methods so they have to be any.
  private onRainfallMonitorButtonClickedBound: any;
  private onTemperatureMonitorButtonClickedBound: any;
  constructor(props: LocationItemProps) {
    super(props);
    this.onRainfallMonitorButtonClickedBound = this.onRainfallMonitorButtonClicked.bind(this);
    this.onTemperatureMonitorButtonClickedBound = this.onTemperatureMonitorButtonClicked.bind(this);
  }

  /**
   * The unbound method that triggers the rainfall monitor click observer to fire.
   */
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

  /**
   * The unbound method that triggers the temperature monitor click observer to fire.
   */
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
