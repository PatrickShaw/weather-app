import {WeatherLocationData} from '../../model/WeatherLocationData';

class AppState {
    public weatherData: WeatherLocationData[];
    constructor(weatherData: WeatherLocationData[]) {
        this.weatherData = weatherData;
    }
}

export {AppState};
export default {AppState};
