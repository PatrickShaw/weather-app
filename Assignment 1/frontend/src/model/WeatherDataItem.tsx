class WeatherDataItem {
    location: string;
    rainfall: string;
    temperature: string;
    constructor(location: string, rainfall: string, temperature: string) {
        this.location = location;
        this.rainfall = rainfall;
        this.temperature = temperature;
    }
}
export {WeatherDataItem};
export default WeatherDataItem;