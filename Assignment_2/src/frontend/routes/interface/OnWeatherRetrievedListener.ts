import {WeatherLocationData} from '../model/WeatherLocationData';

/**
 * Interface for a listener when weather data is retrieved form the SOAP client.
 */
interface OnWeatherRetrievedListener {
  // Called when weather data is retrieved.
  onWeatherRetrieved(weatherLocationDataList: WeatherLocationData[]);
}

export {OnWeatherRetrievedListener};
export default OnWeatherRetrievedListener;
