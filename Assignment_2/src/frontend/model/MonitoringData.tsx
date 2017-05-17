import { WeatherLocationData } from '../../model/WeatherLocationData';
class MonitoringData {
  public readonly weatherDataList: WeatherLocationData[];
  public readonly monitorRainfall: boolean;
  public readonly monitorTemperature: boolean;
  constructor(weatherDataList: WeatherLocationData[], monitorRainfall: boolean, monitorTemperature: boolean) {
    this.weatherDataList = weatherDataList;
    this.monitorRainfall = monitorRainfall;
    this.monitorTemperature = monitorTemperature;
  }
}
export {MonitoringData};
export default MonitoringData;
