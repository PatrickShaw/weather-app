import './LocationItem.scss';

import * as React from 'react';

import { GenericListItem } from './GenericListItem';
import { OnLocationItemClickedObserver } from '../observers/OnLocationItemClickedObserver';

interface LocationItemProps {
  // The location associated with the LocationItem
  readonly prefixedLocation: string;
  readonly location: string;
  readonly serviceTitle: string;
  // Whether the rainfall monitor has been selected for this item.
  readonly rainfallMonitorSelected: boolean; 
  // Whether the temperature monitor ahs been selected for this item.
  readonly temperatureMonitorSelected: boolean; 
  // Specifies what happens when the rainfall monitor button is clicked.
  readonly onRainfallMonitorClickedObserver?: OnLocationItemClickedObserver;
  // Specifies what happens when the temperature monitor button is clicked.
  readonly onTemperatureMonitorClickedObserver?: OnLocationItemClickedObserver;
}

/**
 * A list item that specifically handles a side bar location item.
 * Contains listeners for when inner rain and temperature monitor buttons are clicked.
 */
class LocationItem extends React.Component<LocationItemProps, void> {
  // The bound versions of the original click methods.
  // Unfortunately Typescript doesn't specify the types for these bound methods so they have to be any.
 
  /**
   * The unbound method that triggers the rainfall monitor click observer to fire.
   */
  private onRainfallMonitorButtonClicked(
  ): void {
    if (this.props.onRainfallMonitorClickedObserver != null) {
      // Call parent component onItemClicked() method in passed in onRainfallMonitorClickedObserver.
      this.props.onRainfallMonitorClickedObserver.onItemClicked(
        this.props.prefixedLocation, 
        this.props.rainfallMonitorSelected
      );
    }
  }

  /**
   * The unbound method that triggers the temperature monitor click observer to fire.
   */
  private onTemperatureMonitorButtonClicked(

  ): void {
    if (this.props.onTemperatureMonitorClickedObserver != null) {
      // Call parent component onItemClicked() method in passed in onTemperatureMonitorClickedObserver.
      this.props.onTemperatureMonitorClickedObserver.onItemClicked(
        this.props.prefixedLocation, 
        this.props.temperatureMonitorSelected
      );
    }
  }

  public render(): JSX.Element {
    return (
      <div>
        <div className='location-item'>
          <GenericListItem title={`${this.props.location} (${this.props.serviceTitle})`}>
              <button 
                onClick={() => { this.onRainfallMonitorButtonClicked(); }}
                className={
                  `button-margin button-padding ripple` + 
                  `${this.props.rainfallMonitorSelected ? ' selected' : ''}`
                }
              >
                Rain
              </button>
              <button 
                onClick={() => {this.onTemperatureMonitorButtonClicked(); }}
                className={
                  `button-margin button-padding ripple` + 
                  `${this.props.temperatureMonitorSelected ? ' selected' : ''}`
                }
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
