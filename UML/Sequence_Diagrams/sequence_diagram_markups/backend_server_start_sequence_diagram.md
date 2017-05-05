# Starts at FullLambdaWeatherServerice.run()

actor->FullLambdaWeatherService: run()

FullLambdaWeatherService->WeatherClientFactory: createWeatherClient()

WeatherClientFactory-->FullLambdaWeatherService: weatherClient

FullLambdaWeatherService->FullLambdaWeatherService: onSoapWeatherClientInitialized(weatherClient)

FullLambdaWeatherService->io: emit('locations', [])

FullLambdaWeatherService->io: emit('current_weather_data', [])

FullLambdaWeatherService->FullLambdaWeatherService: initaliseSocketEndpoints()

FullLambdaWeatherService->io: emit('soap_client_creation_success', true)

FullLambdaWeatherService->WeatherClient: retrieveLocations()

WeatherClient-->FullLambdaWeatherService: locations

FullLambdaWeatherService->FullLambdaWeatherService: onAllLocationsRetrieved(locations)

FullLambdaWeatherService->io:emit('locations', locations)

FullLambdaWeatherService->FullLambdaWeatherService: retrieveAllMonitoredWeatherData()

FullLambdaWeatherService->WeatherClient: retrieveWeatherLocationDataList()

WeatherClient-->FullLambdaWeatherService: weatherDataList

FullLambdaWeatherService->FullLambdaWeatherService: onWeatherLocationDataRetrieved(weatherDataList)

FullLambdaWeatherService->Node: setInterval(retrieveAllMonitoredWeatherData(), msInterval)
