/**
 * Just a bunch of event key names so that we can use so that managing event names isn't 
 * difficult.
 */
const keys = {
  // Adds a rainfall monitor
  addRainfallMonitor: 'add_rainfall_monitor',
  // Adds a temperature monitor
  addTemperatureMonitor: 'add_temperature_monitor',
  // Removes a rainfall monitor
  removeRainfallMonitor: 'remove_rainfall_monitor', 
  // Removes a temperature monitor
  removeTemperatureMonitor: 'remove_temperature_monitor',
  // Provides the most up-to-date version of the weather data
  replaceWeatherData: 'current_weather_data',
  // Provides the locations given from the weather client.
  retrievedLocations: 'locations',
  // Triggers when the server has built a its weather client and 
  // once the io events for a given socket have been setup.
  successfulServerSetup: 'successful_server_setup'
};
export default keys; 
