import { WeatherLocationData } from '../../model/WeatherLocationData';
import {observable, action} from 'mobx';
/**
 * Holds information needed by frontend components to determine what to render.
 * Includes a list of WeatherLocationData so it can be plotted on a graph and booleans for weather to show
 * rainfall and/or temperature.
 */

class MonitoredLocationInformation {
  public readonly location: string;
  public readonly serviceTitle: string;
  @observable public readonly weatherDataList: WeatherLocationData[];
  @observable private monitorRainfall: boolean;
  @observable private monitorTemperature: boolean;
  @observable private monitorGraph: boolean;
  constructor(
    location: string,
    serviceTitle: string,
    weatherDataList: WeatherLocationData[],
    monitorRainfall: boolean,
    monitorTemperature: boolean,
    monitorGraph: boolean = false
  ) {
    this.location = location;
    this.serviceTitle = serviceTitle;
    this.weatherDataList = weatherDataList;
    this.monitorRainfall = monitorRainfall;
    this.monitorTemperature = monitorTemperature;
    this.monitorGraph = monitorGraph;
  }
  public getMonitorRainfall(): boolean {
    return this.monitorRainfall;
  }
  @action
  public setMonitorRainfall(shouldMonitor: boolean) {
    this.monitorRainfall = shouldMonitor;
  }
  public getMonitorTemperature(): boolean {
    return this.monitorTemperature;
  }
  @action 
  public setMonitorTemperature(shouldMonitor: boolean) {
    this.monitorTemperature = shouldMonitor;
  }
  public getMonitorGraph(): boolean {
    return this.monitorGraph;
  }
  @action
  public setMonitorGraph(shouldMonitor: boolean) {
    this.monitorGraph = shouldMonitor;
  }
}

export {MonitoredLocationInformation};
export default MonitoredLocationInformation;
