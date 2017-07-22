import * as React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import {
  FullLambdaServiceClient,
  MonitorConnection
} from '../../lambda_client/FullLambdaServiceClient';
import { AppState } from '../model/AppState';
import { MonitorMetadata } from '../../model/MonitorMetadata';
import { MonitoredLocationInformation } from '../model/MonitoredLocationInformation';
import { OnLocationItemClickedObserver } from '../observers/OnLocationItemClickedObserver';
import { OnMonitoringItemClickedObserver } from '../observers/OnMonitoringItemClickedObserver';
import { WeatherPage } from '../view/WeatherPage';

interface WeatherPageContainerProps {
  readonly appState: AppState;
  readonly regularClient: FullLambdaServiceClient;
  readonly timelapseClient: FullLambdaServiceClient;
  readonly regularServicePrefix: string;
  readonly timelapseServicePrefix: string;
}
/**
 * Decides how the current state of the frontend application is manipulated, which, in turn, causes a 
 * re-render of certain components in the DOM.
 * This is a recommended design pattern provided by Redux (as an example for when you don't use the Redux library) 
 * and React.
 * The class acts as a controller in that it coordinates the events of view objects and the interaction to the 
 * backend API.
 */
@observer
class WeatherPageContainer extends React.Component<WeatherPageContainerProps, {}> {
  private onLocationsListRainfallItemClicked: OnLocationItemClickedObserver;
  private onLocationsListTemperatureItemClicked: OnLocationItemClickedObserver;
  public componentDidMount(): void {    
    // Observer that is triggered when rainfall button is clicked for a location.
    // Either toggles it on or off.
    @action
    this.onLocationsListRainfallItemClicked = (prefixedLocation: string, selected: boolean) => {
        // selected is the previous state, weather the button was previously selected or not.
        // If not selected before then selected will be false, we pass in !selected to make it true
        // so we render that component.
        const originalData: MonitoredLocationInformation | undefined = this.props.appState.weatherDataMap.get(prefixedLocation);
        originalData.setMonitorRainfall(!originalData.getMonitorRainfall());
        this.onMonitorSelected(
          this.selectServiceClient(prefixedLocation).rainfallMonitorConnection, 
          new MonitorMetadata(originalData.location),
          selected
        );
    };
    @action
    this.onLocationsListTemperatureItemClicked = (prefixedLocation: string, selected: boolean) => {
        const originalData: MonitoredLocationInformation | undefined = this.props.appState.weatherDataMap.get(prefixedLocation);
        originalData.setMonitorTemperature(!originalData.getMonitorTemperature());
        this.onMonitorSelected(
          this.selectServiceClient(prefixedLocation).temperatureMonitorConnection,
          new MonitorMetadata(originalData.location),
          selected
        );
    };
  }

  /**
   * Selects a service depending on what the prefix specified in the prefixedLocation was.
   */
  @action
  private selectServiceClient(prefixedLocation: string): FullLambdaServiceClient {
    if (prefixedLocation.startsWith(this.props.regularServicePrefix)) {
      return this.props.regularClient;
    } else if (prefixedLocation.startsWith(this.props.timelapseServicePrefix)) {
      return this.props.timelapseClient;
    } else {
      throw new Error(`Could not select service client from prefixed location: ${prefixedLocation}`);
    }
  }

  /**
   * Tells a MonitorConnection to either add or remove a monitor.
   */
  private onMonitorSelected(
    monitorConnection: MonitorConnection,
    monitorMetadata: MonitorMetadata,
    selected: boolean
  ): void {
    if (selected) {
      // We're unselecting a location so emit to remove the monitor
      monitorConnection.removeMonitor(monitorMetadata);
    } else {
      // We're selecting a location so emit to add the monitor
      monitorConnection.addMonitor(monitorMetadata);
    }
  }
  
  public render(): JSX.Element {
    // console.log(this.state.weatherDataMap);
    return (
      this.props.appState.getConnectedToServer() ?
      (
        <WeatherPage 
          appCurrentState={this.props.appState}
          onLocationRainfallItemClickedObserver={this.onLocationsListRainfallItemClicked}
          onLocationTemperatureItemClickedObserver={this.onLocationsListTemperatureItemClicked}
          onMonitoringListGraphItemClicked={this.onMonitoringListGraphItemClicked}
          regularServicePrefix={this.props.regularServicePrefix}
          timelapseServicePrefix={this.props.timelapseServicePrefix}
        />
      ) : 
      (
        <h1 className='error'>
            WeatherMelbourne2 WSDL connection unsuccessful. 
            Make sure your device is connected to the internet and 
            http://viper.infotech.monash.edu.au:8180/axis2/services/MelbourneWeather2?wsdl is available.
        </h1>
      )
    );
  }
}
export {WeatherPageContainer};
export default WeatherPageContainer;
