import * as SocketIo from 'socket.io-client';
import {appState} from './state';
import {
  FullLambdaServiceClient,
  OnLocationsRetrievedObserver,
  OnMonitorAddedObserver,
  OnWeatherLocationDataListRetrievedObserver,
} from '../lambda_client/FullLambdaServiceClient';
import { WeatherLocationData } from '../model/WeatherLocationData';
import { RequestResponse } from '../model/RequestResponse';
import { MonitoredLocationInformation } from './model/MonitoredLocationInformation';
import { LocationServicePrefixer } from './LocationServicePrefixer';

// Create anon class to handle retrieving a list of weather data.
function createWeatherDataListRetrievedObserver(servicePrefix: string): OnWeatherLocationDataListRetrievedObserver {
  return (weatherLocationDataList: WeatherLocationData[]) => {
      // We received some fresh weather data.
      // Tell React that we may need to re-render
      // Handle updates for cards and adding a new data point to graphs.
      // Use to determine what cards are rendered and what information is in them (textual, graphical)
      // and for rainfall and/or temperature.
      const timeStamp: string = new Date().toString();
      console.log('Received weather location data at time: ' + timeStamp);
      console.log(weatherLocationDataList);
        
      const newWeatherDataMap: Map<string, MonitoredLocationInformation> = appState.weatherDataMap;
      console.log(appState);
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
function createServiceMonitorAddedObserver(servicePrefix: string): OnMonitorAddedObserver {
  return (addMonitorResponse: RequestResponse<WeatherLocationData>) => {
      // First, make sure we didn't receive an error
      if (addMonitorResponse.error == null) {
        // Good, we didn't receive an error, add the new weather data into our state's weather hash map.
        const newWeatherData: WeatherLocationData = addMonitorResponse.data;
        const weatherDataMap: Map<string, MonitoredLocationInformation> = appState.weatherDataMap;
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
// Create anon class to handle what happens when locations are retrieved.
function createOnLocationsRetrievedObserver(
  servicePrefix: string, 
  serviceTitle: string
): OnLocationsRetrievedObserver {
  // Set the locations and 
  return (sortedLocations: string[]) => {
      // Now that we have the locations, we need to initialize the MonitoredLocationInformation.
      // You could lazy-initialize them but that would more complicated code with minimal benefits.
      for (const location of sortedLocations) {
        const prefixedLocation: string = LocationServicePrefixer.prefixLocation(servicePrefix, location);
        appState.weatherDataMap.set(
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
        appState.insertServiceLocation(servicePrefix, location);
      }
  };
}
function initializeServiceClientObservers(
  serviceClient: FullLambdaServiceClient,
  servicePrefix: string,
  serviceTitle: string
): void {
  // Create the weather data list observer
  serviceClient.addOnWeatherLocationDataListRetrievedObserver(
    createWeatherDataListRetrievedObserver(servicePrefix)
  );
  // Create the server setup observer.
  serviceClient.addOnServerSetupSuccessRetrievedObserver(
      (success: boolean) => {
        appState.setConnectedToServer(success);
      }
  );
  serviceClient.addOnLocationsRetrievedObserver(createOnLocationsRetrievedObserver(servicePrefix, serviceTitle));
  // Create observers specific to this service.
  const onMonitorAddedObserver: OnMonitorAddedObserver = createServiceMonitorAddedObserver(servicePrefix);

  // Rainfall monitors
  serviceClient.rainfallMonitorConnection.addMonitorAddedObserver(onMonitorAddedObserver);

  // Temperature monitors
  serviceClient.temperatureMonitorConnection.addMonitorAddedObserver(onMonitorAddedObserver);
  // TODO: We can reconfirm the monitorRainfall and monitorTemperature via removeMonitorEvent observers.
}

class FullLambdaFrontendClient {
  public readonly client: FullLambdaServiceClient;
  public readonly servicePrefix: string;
  public constructor(client: FullLambdaServiceClient, servicePrefix: string, title: string) {
    this.client = client;
    this.servicePrefix = servicePrefix;
    initializeServiceClientObservers(client, servicePrefix, title);
  }
}
const regularClient = new FullLambdaFrontendClient(new FullLambdaServiceClient(SocketIo.connect('http://127.0.0.1:8081')), 'regular_service_', "Original");
const timelapseClient = new FullLambdaFrontendClient(new FullLambdaServiceClient(SocketIo.connect('http://127.0.0.1:8080')), 'timelapse_service_', "Timelapse");
// TODO: FullLambdaFrontendClient shouldn't be able to be constructed elsewhere
export {regularClient, timelapseClient, FullLambdaFrontendClient}