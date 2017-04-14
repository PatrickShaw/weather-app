import {WeatherDataItem} from './WeatherDataItem';
class AppState {
    weatherData: Array<WeatherDataItem>;
    constructor(weatherData: Array<WeatherDataItem>) {
        this.weatherData = weatherData;
    }
}
export {AppState};
export default {AppState};