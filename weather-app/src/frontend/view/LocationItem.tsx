import './LocationItem.css';

import * as React from 'react';

import { GenericListItem } from './GenericListItem';
import { observer } from 'mobx-react';
import { MonitorMetadata } from '../../model/MonitorMetadata';
import {
  MonitorConnection
} from '../../lambda_client/FullLambdaServiceClient';
import {appState} from '../state';
import {MonitoredLocationInformation} from '../model/MonitoredLocationInformation';
import {regularClient, timelapseClient, FullLambdaFrontendClient} from '../clients';
interface LocationItemProps {
  // The location associated with the LocationItem
  readonly prefixedLocation: string;
  readonly location: string;
  readonly serviceTitle: string;
  // Whether the rainfall monitor has been selected for this item.
  readonly rainfallMonitorSelected: boolean; 
  // Whether the temperature monitor ahs been selected for this item.
  readonly temperatureMonitorSelected: boolean; 
}

/**
 * Selects a service depending on what the prefix specified in the prefixedLocation was.
 */
function selectServiceClient(prefixedLocation: string): FullLambdaFrontendClient {
  if (prefixedLocation.startsWith(regularClient.servicePrefix)) {
    return regularClient;
  } else if (prefixedLocation.startsWith(timelapseClient.servicePrefix)) {
    return timelapseClient;
  } else {
    throw new Error(`Could not select service client from prefixed location: ${prefixedLocation}`);
  }
}

function onMonitorSelected(
    prefixedLocation: string,
    monitorConnection: MonitorConnection,
    selected: boolean,
    setMonitor: (originalData: MonitoredLocationInformation, selected: boolean)=>void
  ): void {
    // selected is the previous state, weather the button was previously selected or not.
    // If not selected before then selected will be false, we pass in !selected to make it true
    // so we render that component.
    const originalData: MonitoredLocationInformation | undefined = appState.weatherDataMap.get(prefixedLocation);
    if (originalData == null) { 
        throw new Error('There was no monitoring information.'); 
    }  
    setMonitor(originalData, selected);
    const monitorMetadata: MonitorMetadata = new MonitorMetadata(originalData.location);
    if (selected) {
      // We're unselecting a location so emit to remove the monitor
      monitorConnection.removeMonitor(monitorMetadata);
    } else {
      // We're selecting a location so emit to add the monitor
      monitorConnection.addMonitor(monitorMetadata);
    }
  }

/**
 * A list item that specifically handles a side bar location item.
 * Contains listeners for when inner rain and temperature monitor buttons are clicked.
 */
const LocationItem: React.ClassicComponentClass<LocationItemProps> = observer(({
  prefixedLocation, 
  location, 
  serviceTitle, 
  rainfallMonitorSelected, 
  temperatureMonitorSelected,
}: LocationItemProps) => (
  <div>
    <div className='location-item'>
      <GenericListItem title={`${location} (${serviceTitle})`}>
          <button 
            onClick={() => { onMonitorSelected(prefixedLocation, selectServiceClient(prefixedLocation).client.rainfallMonitorConnection, rainfallMonitorSelected, (originalData, selected)=>{originalData.setMonitorRainfall(!selected)})}}
            className={
              `button-margin button-padding ripple` + 
              `${rainfallMonitorSelected ? ' selected' : ''}`
            }
          >
            Rain
          </button>
          <button 
            onClick={() => { onMonitorSelected(prefixedLocation, selectServiceClient(prefixedLocation).client.temperatureMonitorConnection, temperatureMonitorSelected, (originalData, selected)=>{originalData.setMonitorTemperature(!selected)})}}
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
