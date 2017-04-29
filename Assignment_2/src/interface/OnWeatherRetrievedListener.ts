import {WeatherLocationData} from '../model/WeatherLocationData';

interface OnWeatherRetrievedListener {
  // Method?
  onWeatherRetrieved(weatherLocationDataList: WeatherLocationData[]);
}

export {OnWeatherRetrievedListener};
export default OnWeatherRetrievedListener;
