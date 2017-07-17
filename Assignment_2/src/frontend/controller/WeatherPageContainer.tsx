import * as React from 'react';
import * as SocketIo from 'socket.io-client';

import {
  FullLambdaServiceClient,
  MonitorConnection,
  OnLocationsRetrievedObserver,
  OnMonitorAddedObserver,
  OnWeatherLocationDataListRetrievedObserver,
} from '../../lambda_client/FullLambdaServiceClient';

import { AppState } from '../model/AppState';
import { LocationServicePrefixer } from '../LocationServicePrefixer';
import { MonitorMetadata } from '../../model/MonitorMetadata';
import { MonitoredLocationInformation } from '../model/MonitoredLocationInformation';
import { OnLocationItemClickedObserver } from '../observers/OnLocationItemClickedObserver';
import { OnMonitoringItemClickedObserver } from '../observers/OnMonitoringItemClickedObserver';
import { RequestResponse } from '../../model/RequestResponse';
import { WeatherLocationData } from '../../model/WeatherLocationData';
import { WeatherPage } from '../view/WeatherPage';

interface WeatherPageContainerProps {
  readonly regularServiceUrl: string;
  readonly timelapseServiceUrl: string;
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
class WeatherPageContainer extends React.Component<WeatherPageContainerProps, AppState> {
  private onLocationsListRainfallItemClicked: OnLocationItemClickedObserver;
  private onLocationsListTemperatureItemClicked: OnLocationItemClickedObserver;
  private onMonitoringListGraphItemClicked: OnMonitoringItemClickedObserver;
  private readonly regularServiceClient: FullLambdaServiceClient;
  private readonly timelapseServiceClient: FullLambdaServiceClient;

  constructor(props: WeatherPageContainerProps) {
    super(props);
    // Start the state off with a bunch of empty lists.
    this.state = new AppState([], new Map<string, MonitoredLocationInformation>(), false);
    // Connects to the port that the backend is listening on.
    // Triggers io.on('connection')'s callback
    this.regularServiceClient = new FullLambdaServiceClient(SocketIo.connect(this.props.regularServiceUrl));
    this.timelapseServiceClient = new FullLambdaServiceClient(SocketIo.connect(this.props.timelapseServiceUrl));
  }
  
  // Create anon class to handle what happens when locations are retrieved.
  private createOnLocationsRetrievedObserver(
    servicePrefix: string, 
    serviceTitle: string
  ): OnLocationsRetrievedObserver {
    // Set the locations and 
    return (sortedLocations: string[]) => {
        // Now that we have the locations, we need to initialize the MonitoredLocationInformation.
        // You could lazy-initialize them but that would more complicated code with minimal benefits.
        for (const location of sortedLocations) {
          const prefixedLocation: string = LocationServicePrefixer.prefixLocation(servicePrefix, location);
          this.state.weatherDataMap.set(
            prefixedLocation, 
            new MonitoredLocationInformation(
              location,
              serviceTitle, 
              [], 
              false, 
              false, 
              false
            )
          );
          AppState.insertServiceLocation(this.state, servicePrefix, location);
        }
        console.log(this.state);
    };
  }

  // Create anon class to handle retrieving a list of weather data.
  private createWeatherDataListRetrievedObserver(servicePrefix: string): OnWeatherLocationDataListRetrievedObserver {
    return (weatherLocationDataList: WeatherLocationData[]) => {
        // We received some fresh weather data.
        // Tell React that we may need to re-render
        // Handle updates for cards and adding a new data point to graphs.
        // Use to determine what cards are rendered and what information is in them (textual, graphical)
        // and for rainfall and/or temperature.
        const timeStamp: string = new Date().toString();
        console.log('Received weather location data at time: ' + timeStamp);
        console.log(weatherLocationDataList);
          
        const newWeatherDataMap: Map<string, MonitoredLocationInformation> = this.state.weatherDataMap;
        console.log(this.state);
        // Loop for each WeatherLocationData object sent by backend.
        for (const weatherLocationData of weatherLocationDataList) {
          const monitoredLocationInformation: MonitoredLocationInformation | undefined = newWeatherDataMap
            .get(LocationServicePrefixer.prefixLocation(servicePrefix, weatherLocationData.location));
          if (monitoredLocationInformation == null) {
            throw new Error('No monitoring information was retrieved.');
          }
          // Add this weatherLocationData received to array of weatherLocationData.
          monitoredLocationInformation.weatherDataList.push(weatherLocationData);
        }
    };
  }

  // Create anon class to handle adding a monitor response.
  private createServiceMonitorAddedObserver(servicePrefix: string): OnMonitorAddedObserver {
    return (addMonitorResponse: RequestResponse<WeatherLocationData>) => {
        // First, make sure we didn't receive an error
        if (addMonitorResponse.error == null) {
          // Good, we didn't receive an error, add the new weather data into our state's weather hash map.
          const newWeatherData: WeatherLocationData = addMonitorResponse.data;
          const weatherDataMap: Map<string, MonitoredLocationInformation> = this.state.weatherDataMap;
          const prefixedLocation: string = LocationServicePrefixer.prefixLocation(
              servicePrefix, newWeatherData.location);
          const monitoringData: MonitoredLocationInformation | undefined 
            = weatherDataMap.get(prefixedLocation);
          if (monitoringData != null) {
            weatherDataMap.set(prefixedLocation, monitoringData);
            monitoringData.weatherDataList.push(newWeatherData);
          } else {
            console.error('Could not find monitoring data');
          }
        } else {
          console.error(addMonitorResponse.error);
        }
    };
  }

  public componentDidMount(): void {
    // Create on click monitor listeners
    this.onMonitoringListGraphItemClicked = (locationKey: string) => {
        const monitoredLocationInformation: MonitoredLocationInformation | undefined = 
          this.state.weatherDataMap.get(locationKey);
        if (monitoredLocationInformation != null) { 
          const newMonitoredLocationInformation: MonitoredLocationInformation = new MonitoredLocationInformation(
            monitoredLocationInformation.location,
            monitoredLocationInformation.serviceTitle,
            monitoredLocationInformation.weatherDataList, 
            monitoredLocationInformation.monitorRainfall,
            monitoredLocationInformation.monitorTemperature,
            !monitoredLocationInformation.monitorGraph
          );
          // Update WeatherDataMap.
          this.state.weatherDataMap.set(locationKey, newMonitoredLocationInformation);
        } else {
          console.error(`Error: monitoredLocationInformation could not be found for ${locationKey}`);
        }
    };
    
    // Observer that is triggered when rainfall button is clicked for a location.
    // Either toggles it on or off.
    this.onLocationsListRainfallItemClicked = (prefixedLocation: string, selected: boolean) => {
        // selected is the previous state, weather the button was previously selected or not.
        // If not selected before then selected will be false, we pass in !selected to make it true
        // so we render that component.
        const originalData: MonitoredLocationInformation | undefined = this.state.weatherDataMap.get(prefixedLocation);
        let newData: MonitoredLocationInformation;
        if (originalData == null) {
           throw new Error('There was no monitoring information.');
        } 
        newData = new MonitoredLocationInformation(
          originalData.location,
          originalData.serviceTitle,
          originalData.weatherDataList, 
          !selected,
          originalData.monitorTemperature,
          originalData.monitorGraph
        );

        // Add new data to the state in AppState weatherMap in memory.
        this.state.weatherDataMap.set(prefixedLocation, newData);

        this.onMonitorSelected(
          this.selectServiceClient(prefixedLocation).rainfallMonitorConnection, 
          new MonitorMetadata(newData.location),
          selected
        );
    };

    this.onLocationsListTemperatureItemClicked = (prefixedLocation: string, selected: boolean) => {
        const originalData: MonitoredLocationInformation | undefined = this.state.weatherDataMap.get(prefixedLocation);
        let newData: MonitoredLocationInformation;
        if (originalData == null) {
          throw new Error('Could not find orginal monitoring information.');
        }
        newData = new MonitoredLocationInformation(
          originalData.location,
          originalData.serviceTitle,
          originalData.weatherDataList, 
          originalData.monitorRainfall,
          !selected,
          originalData.monitorGraph
        );
        this.state.weatherDataMap.set(prefixedLocation, newData);
        this.onMonitorSelected(
          this.selectServiceClient(prefixedLocation).temperatureMonitorConnection,
          new MonitorMetadata(newData.location),
          selected
        );
    };

    // Initialize the socket end points for the original FullLambdaService from stage 1.
    this.initializeServiceClientObservers(this.regularServiceClient, this.props.regularServicePrefix, 'Original');
    // Initialize the socket end points for the original FullLambdaService from stage 2.
    this.initializeServiceClientObservers(this.timelapseServiceClient, this.props.timelapseServicePrefix, 'Timelapse');
  }

  /**
   * Selects a service depending on what the prefix specified in the prefixedLocation was.
   */
  private selectServiceClient(prefixedLocation: string): FullLambdaServiceClient {
    if (prefixedLocation.startsWith(this.props.regularServicePrefix)) {
      return this.regularServiceClient;
    } else if (prefixedLocation.startsWith(this.props.timelapseServicePrefix)) {
      return this.timelapseServiceClient;
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
  
  private initializeServiceClientObservers(
    serviceClient: FullLambdaServiceClient,
    servicePrefix: string,
    serviceTitle: string
  ): void {
    // Create the weather data list observer
    serviceClient.addOnWeatherLocationDataListRetrievedObserver(
      this.createWeatherDataListRetrievedObserver(servicePrefix)
    );
    // Create the server setup observer.
    serviceClient.addOnServerSetupSuccessRetrievedObserver(
        (success: boolean) => {
          this.state.connectedToServer = success;
        }
    );
    serviceClient.addOnLocationsRetrievedObserver(this.createOnLocationsRetrievedObserver(servicePrefix, serviceTitle));
    // Create observers specific to this service.
    const onMonitorAddedObserver: OnMonitorAddedObserver = this.createServiceMonitorAddedObserver(servicePrefix);

    // Rainfall monitors
    serviceClient.rainfallMonitorConnection.addMonitorAddedObserver(onMonitorAddedObserver);

    // Temperature monitors
    serviceClient.temperatureMonitorConnection.addMonitorAddedObserver(onMonitorAddedObserver);
    // TODO: We can reconfirm the monitorRainfall and monitorTemperature via removeMonitorEvent observers.
  }
  
  public render(): JSX.Element {
    // console.log(this.state.weatherDataMap);
    return (
      this.state.connectedToServer ?
      (
        <WeatherPage 
          appCurrentState={this.state}
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
