import {WeatherLocationData} from '../../model/Models';
class AppState {
    weatherData: Array<WeatherLocationData>;
    constructor(weatherData: Array<WeatherLocationData>) {
        this.weatherData = weatherData;
    }
}
export {AppState};
export default {AppState};
