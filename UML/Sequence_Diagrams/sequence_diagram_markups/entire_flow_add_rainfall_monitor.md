# Starts with a user clicking on add rainfall.

Actor->GenericListItem: click add rainfall for a location

GenericListItem->LocationListItem: onClick()

LocationListItem->LocationListItem: onRainfallMonitorButtonClicked(event)

LocationListItem->OnLocationItemClickedObserver: onItemClicked(location, true)

OnLocationItemClickedObserver->io: emit('add_rainfall_monitor', monitor)

OnLocationItemClickedObserver-->LocationListItem: return

LocationListItem-->GenericListItem: return

io->FullLambdaWeatherService: socket on ('add_rainfall_monitor', callback function)

FullLambdaWeatherService->SessionMonitoringManager: getLocationMonitorManagerForSession(sessionId)

SessionMonitoringManager-->FullLambdaWeatherService: locationMonitor

FullLambdaWeatherService->LocationMonitoringManager: addMonitorLocation(monitor)

LocationMonitoringManager-->FullLambdaWeatherService: return

FullLambdaWeatherService->WeatherClient: retrieveWeatherLocationData(location, false, false, false)

WeatherClient-->FullLambdaWeatherService: 

FullLambdaWeatherService->io: emit('add_rainfall_monitor', request_response)

io->WeatherPageContainer: socket on('add_rainfall_monitor', )

WeatherPageContainer->WeatherPageContainer: setState(newWeatherData)

React->React: render()

