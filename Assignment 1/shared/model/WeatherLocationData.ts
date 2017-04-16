import {RainfallData} from './RainfallData';
import {TemperatureData} from './TemperatureData';
class WeatherLocationData {
    location: string;
    rainfallData: RainfallData;
    temperatureData: TemperatureData;
    constructor(location: string, rainfallData: RainfallData, temperatureData: TemperatureData) {
        this.location = location;   
        this.rainfallData = rainfallData;
        this.temperatureData = temperatureData;
    }
}
export {WeatherLocationData};
export default WeatherLocationData;