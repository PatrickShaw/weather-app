# Starts in function FullLambdaWeatherService.retrieveAllMonitoredWeatherData()

NodeJSTimer->FullLambdaWeatherService: retrieveAllMonitoredWeatherData()

FullLambdaWeatherService->WeatherClient: retrieveWeatherLocationDataList(locations)

loop for each location

WeatherClient->WeatherClient: retrieveWeatherLocationData(location)

end

WeatherClient-->FullLambdaWeatherService: weatherLocationDataList

FullLambdaWeatherService->FullLambdaWeatherService: onWeatherLocationDataRetrieved(weatherLocationDataList)

loop for sessionId in sessions

FullLambdaWeatherService->SessionMonitoringManager: getLocationMonitorManagerForSession(sessionId) getMonitoredLocations()

SessionMonitoringManager->LocationMonitoringManger: getMonitoredLocations()

LocationMonitoringManger-->SessionMonitoringManager: locations

SessionMonitoringManager-->FullLambdaWeatherService: locations

FullLambdaWeatherService->io: emit(current_weather_data, weatherDataToEmit)

end
