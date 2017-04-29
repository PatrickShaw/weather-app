import {RainfallData} from './RainfallData';
import {TemperatureData} from './TemperatureData';

/**
 * Class that represents weather data.
 * Has a location, RainfallData object and TemperatureData object.
 */
class WeatherLocationData {
    private readonly location: string;
    private readonly rainfallData: RainfallData;
    private readonly temperatureData: TemperatureData;

    constructor(location: string, rainfallData: RainfallData, temperatureData: TemperatureData) {
        this.location = location;   
        this.rainfallData = rainfallData;
        this.temperatureData = temperatureData;
    }

    public getLocation(): string {
        return this.location;
    }

    public getRainfallData(): RainfallData {
        return this.rainfallData;
    }

    public getTemperatureData(): TemperatureData {
        return this.temperatureData;
    }
    
}
export {WeatherLocationData};
export default WeatherLocationData;
