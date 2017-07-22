import './LocationItem.css';

import * as React from 'react';

import { GenericListItem } from './GenericListItem';
import { OnLocationItemClickedObserver } from '../observers/OnLocationItemClickedObserver';
import { observer } from 'mobx-react';
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
const LocationItem = observer(({
  prefixedLocation, 
  location, 
  serviceTitle, 
  rainfallMonitorSelected, 
  temperatureMonitorSelected,
  onRainfallMonitorClickedObserver, 
  onTemperatureMonitorClickedObserver
}: LocationItemProps) => (
  <div>
    <div className='location-item'>
      <GenericListItem title={`${location} (${serviceTitle})`}>
          <button 
            onClick={() => { onRainfallMonitorClickedObserver ? onRainfallMonitorClickedObserver(prefixedLocation, rainfallMonitorSelected) : null }}
            className={
              `button-margin button-padding ripple` + 
              `${rainfallMonitorSelected ? ' selected' : ''}`
            }
          >
            Rain
          </button>
          <button 
            onClick={() => { onTemperatureMonitorClickedObserver ? onTemperatureMonitorClickedObserver(prefixedLocation, temperatureMonitorSelected) : null }}
            className={
              `button-margin button-padding ripple` + 
              `${temperatureMonitorSelected ? ' selected' : ''}`
            }
          >
            Temp
          </button>
      </GenericListItem>
    </div>
  </div>
));
export {LocationItem};
export default LocationItem;
