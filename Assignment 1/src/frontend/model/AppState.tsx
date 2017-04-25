import {WeatherLocationData} from '../../model/index';
class AppState {
    weatherData: Array<WeatherLocationData>;
    constructor(weatherData: Array<WeatherLocationData>) {
        this.weatherData = weatherData;
    }
}
export {AppState};
export default {AppState};
