import { WeatherLocationData } from '../model/WeatherLocationData';
/**
 * An interface that provides methods to talk to a conceptual weather client.
 * We created this interface (as opposed to just a concrete class) because we intend on swapping the 
 * MelbourneService2 SOAP API out for a real world weather REST API. This interface allows us to do so 
 * without having to change more than two lines of driver code (provided that these methods will suffice when 
 * swapping to a real world weather client). It also allows us to swap the SOAP API client out for a test weather 
 * client so we can test our application without being connected to the internet.
 */
interface WeatherClient {
  
  /**
   * Retrieves all locations from the weather client.
   */
  retrieveLocations(): Promise<string[]>;
  
  /**
   * Retrieves a single piece of weather data according to a provided location.
   */
  retrieveWeatherLocationData(
    location: string, // The location that we're going to get the weather data for.
    getRainfall: boolean, // Whether or not we want to retrieve rainfall data.
    getTemperature: boolean, // Whether we or not we want to retrieve temperature data.
    forceRefresh: boolean // Whether we want to force the retrieval of the weather data.
  ): Promise<WeatherLocationData>;
  
  /**
   * Retrieves all weather data associated with the provided locations list.
   */
  retrieveWeatherLocationDataList(locations: string[]): Promise<WeatherLocationData[]>;
}
export { WeatherClient };
export default WeatherClient;
