/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("chalk");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A piece of client data that holds a timestamp.
 */
class TimestampedData {
    constructor(timestamp) {
        if (timestamp === '') {
            // Handle no data from SOAP client.
            this.timestamp = 'N/A';
        }
        else {
            this.timestamp = timestamp;
        }
    }
}
exports.TimestampedData = TimestampedData;
exports.default = TimestampedData;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class that represents weather data.
 * Has a location, RainfallData object and TemperatureData object.
 */
class WeatherLocationData {
    constructor(location, rainfallData, temperatureData) {
        this.location = location;
        this.rainfallData = rainfallData;
        this.temperatureData = temperatureData;
    }
}
exports.WeatherLocationData = WeatherLocationData;
exports.default = WeatherLocationData;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const chalk = __webpack_require__(0);
const LocationMonitoringManager_1 = __webpack_require__(12);
const RequestError_1 = __webpack_require__(9);
const RequestResponse_1 = __webpack_require__(10);
const SessionMonitoringManager_1 = __webpack_require__(13);
const WeatherLocationData_1 = __webpack_require__(2);
const socket_keys_1 = __webpack_require__(14);
// TODO: Consider if having soft dependencies on Temp & Rainfall & their request data types is better
// allows for dependency injection where you pass in req parameters.
// 300000 milliseconds = 5 mins.
const defaultWeatherPollingInterval = 5000;
/**
 * Controller class instantiated by the node server. This specifies the core logic specified in
 * assignment 1 of FIT3077. Although the class may look giant, the majority of the service consists of comments,
 * try-catches and methods seperated over multiple lines.
 */
class FullLambdaService {
    constructor(io, weatherClientFactory, weatherInterval = defaultWeatherPollingInterval) {
        // Weather client hasn't been built yet so this is false.
        this.successfulClientSetup = false;
        // Locations will be empty for now, better than nothing.
        this.melbourneWeatherLocations = [];
        this.io = io;
        this.weatherClientFactory = weatherClientFactory;
        // Time to compile our monitoring manager data
        // Could probably dependency inject the SessionMontoringManager but that's a bit overkill
        this.rainfallMonitoringData = new MonitoringManagerData(new SessionMonitoringManager_1.SessionMonitoringManager(), socket_keys_1.default.addRainfallMonitor, socket_keys_1.default.removeRainfallMonitor);
        this.temperatureMonitoringData = new MonitoringManagerData(new SessionMonitoringManager_1.SessionMonitoringManager(), socket_keys_1.default.addTemperatureMonitor, socket_keys_1.default.removeTemperatureMonitor);
        this.monitoringDataList = [
            this.rainfallMonitoringData,
            this.temperatureMonitoringData
        ];
        this.weatherPollingInterval = weatherInterval;
    }
    /**
     * We need to setup the websocket end points so that consumers of the API can actually communicate with
     * the API itself. This method does just that.
     */
    initialiseSocketEndpoints() {
        this.io.sockets.on('connection', (socket) => {
            // Called when session started with frontend.
            const sessionId = socket.id;
            console.log(`Session started ${sessionId}`);
            // Pass them some fresh data, if the server went down, we should let the API consumers
            socket.emit(socket_keys_1.default.retrievedLocations, this.melbourneWeatherLocations);
            socket.emit(socket_keys_1.default.replaceWeatherData, []);
            // Add MonitoringManagerData to manage session with front end client.
            for (const monitoringManager of this.monitoringDataList) {
                monitoringManager.sessionManager.addMonitoringSession(sessionId, new LocationMonitoringManager_1.LocationMonitoringManager());
                this.initialiseMonitorSocketEvent(socket, monitoringManager.addMonitorEventName, monitoringManager.removeMonitorEventName, monitoringManager.sessionManager);
            }
            socket.on('disconnect', () => {
                console.log(`Session ended: ${sessionId}`);
                // Once a session has ended we need to remove it from our records so that the API doesn't try 
                // emit data to the disconnected socket.
                for (const monitoringManager of this.monitoringDataList) {
                    monitoringManager.sessionManager.removeMonitoringSession(sessionId);
                }
            });
            // Emit to front end whether the SOAP Client was successfully created.
            socket.emit(socket_keys_1.default.successfulServerSetup, this.successfulClientSetup);
        });
    }
    initialiseMonitorSocketEvent(socket, addEventName, removeEventName, sessionManager) {
        const sessionId = socket.id;
        socket.on(addEventName, (monitor) => {
            try {
                // Frontend sessions wants to monitor another location.
                // monitor is a string that is a location.
                const locationMonitoringManager = sessionManager.getLocationMonitorManagerForSession(sessionId);
                if (locationMonitoringManager) {
                    console.log(`Session ID ${chalk.magenta(sessionId)} added monitor ${chalk.magenta(monitor.location)}`);
                    // Can add monitor.
                    // Add new location to monitor to all locations that are monitored.
                    locationMonitoringManager.addMonitorLocation(monitor);
                    const rainfallLocationManager = this.rainfallMonitoringData.sessionManager.getLocationMonitorManagerForSession(sessionId);
                    const temperatureLocationMonitor = this.temperatureMonitoringData.sessionManager.getLocationMonitorManagerForSession(sessionId);
                    // Time to get the data from the weather client and emit to the socket who added the monitor
                    this.weatherClient.retrieveWeatherLocationData(monitor.location, rainfallLocationManager.getMonitoredLocations().has(monitor.location), temperatureLocationMonitor.getMonitoredLocations().has(monitor.location), false).then((weatherLocationData) => {
                        socket.emit(addEventName, new RequestResponse_1.RequestResponse(weatherLocationData, null));
                    }).catch((error) => {
                        console.error(chalk.red(error.message));
                        console.error(chalk.red(error.stack));
                    });
                }
                else {
                    // Can't add monitor.
                    console.error(`${chalk.red('Could add monitor. No session for ID: ')}${chalk.magenta(sessionId)}`);
                    const requestError = new RequestError_1.RequestError(`Could add monitor ${monitor}.`, `No session for ID: ' ${sessionId}`);
                    const response = new RequestResponse_1.RequestResponse(null, requestError);
                    socket.emit(addEventName, response);
                }
            }
            catch (error) {
                const requestError = new RequestError_1.RequestError(`Failed to add monitor for location ${monitor}`, error.message);
                const response = new RequestResponse_1.RequestResponse(null, requestError);
                console.error(chalk.red(error.message));
                console.error(chalk.red(error.stack));
                socket.emit(addEventName, response);
            }
        });
        socket.on(removeEventName, (monitor) => {
            // monitor is a string that is a location.
            // Frontend emitted remove_monitor with MonitorMetadata.
            try {
                // Note: | means can be type_a or type_b where type_a | type_b.
                const locationMonitoringManager = sessionManager.getLocationMonitorManagerForSession(sessionId);
                if (locationMonitoringManager) {
                    console.log(`Session ID ${chalk.magenta(sessionId)} ` +
                        `removed ${chalk.magenta(removeEventName)} monitor ${chalk.magenta(monitor.location)}`);
                    // Can remove location.
                    locationMonitoringManager.removeMonitoredLocation(monitor);
                    socket.emit(removeEventName, new RequestResponse_1.RequestResponse(monitor, null));
                }
                else {
                    // Can't remove location.
                    console.error(`${chalk.red('Could remove monitor. No session for ID: ')}${chalk.magenta(sessionId)}`);
                    const requestError = new RequestError_1.RequestError(`Could remove monitor ${monitor}.`, `No session for ID: ' ${sessionId}`);
                    const response = new RequestResponse_1.RequestResponse(null, requestError);
                    socket.emit(removeEventName, response);
                }
            }
            catch (error) {
                const requestError = new RequestError_1.RequestError(`Failed to remove monitor for location ${monitor}`, error.message);
                const response = new RequestResponse_1.RequestResponse(null, requestError);
                console.error(chalk.red(error.message));
                console.error(chalk.red(error.stack));
                socket.emit(removeEventName, response);
            }
        });
    }
    onAllLocationsRetrieved(locations) {
        // Retrieves all locations from SOAP client points.
        // Only called once, under the assumption locations are set.
        this.melbourneWeatherLocations = locations;
        this.melbourneWeatherLocations.sort();
        // Send locations to front end.
        this.io.sockets.emit(socket_keys_1.default.retrievedLocations, locations);
        console.log(chalk.cyan(`locations: ${locations}`));
        // setInterval() is a JavaScript method that runs the method every msInterval milliseconds.
        // Note: setInterval() doesn't get data at time 0.
        this.retrieveAllMonitoredWeatherData();
        setInterval(() => { this.retrieveAllMonitoredWeatherData(); }, this.weatherPollingInterval);
    }
    onWeatherLocationDataRetrieved(weatherLocationDataList) {
        // Logs timestamp and weatherLocationDataList in backend before sending data to frontend.
        // Send updated data to front end.
        const retrievedDataTimeStamp = new Date().toString();
        console.log(chalk.green('Retrieved') +
            chalk.magenta(` ${weatherLocationDataList.length} `) +
            chalk.green('weather data items at time:') +
            chalk.magenta(` ${retrievedDataTimeStamp} `));
        // Note: sockets.sockets is a Socket IO library attribute.
        for (const sessionId of Object.keys(this.io.sockets.sockets)) {
            try {
                console.info(`Getting monitoring session for session ID: ${chalk.magenta(sessionId)}`);
                let validSessionMonitors = true;
                for (const monitoringSession of this.monitoringDataList) {
                    const sessionManager = monitoringSession.sessionManager;
                    if (!sessionManager) {
                        validSessionMonitors = false;
                        break;
                    }
                }
                if (!validSessionMonitors) {
                    console.error(chalk.red(`Socket ${chalk.magenta(sessionId)} had no monitoring session. Skipping emit.`));
                    continue;
                }
                let hasDataToEmit = false;
                for (const monitoringSession of this.monitoringDataList) {
                    if (monitoringSession.sessionManager.getAllMonitoredLocations().size > 0) {
                        hasDataToEmit = true;
                        break;
                    }
                }
                if (!hasDataToEmit) {
                    console.log(`Session ID ${chalk.magenta(sessionId)} wasn't monitoring anything, skipping emission.`);
                    continue;
                }
                const rainfallToEmitWeatherFor = this.rainfallMonitoringData.sessionManager.getAllMonitoredLocations();
                const temperatureToEmitWeatherFor = this.temperatureMonitoringData.sessionManager.getAllMonitoredLocations();
                // We only need to emit data if the user is monitoring a location.
                // Otherwise don't even bother executing the emission code.
                const weatherDataToEmit = [];
                for (const weatherData of weatherLocationDataList) {
                    const emitRainfall = rainfallToEmitWeatherFor.has(weatherData.location);
                    const emitTemperature = temperatureToEmitWeatherFor.has(weatherData.location);
                    if (emitTemperature && emitRainfall) {
                        weatherDataToEmit.push(weatherData);
                    }
                    else if (emitRainfall) {
                        weatherDataToEmit.push(new WeatherLocationData_1.WeatherLocationData(weatherData.location, weatherData.rainfallData, null));
                    }
                    else if (emitTemperature) {
                        weatherDataToEmit.push(new WeatherLocationData_1.WeatherLocationData(weatherData.location, null, weatherData.temperatureData));
                    }
                    const socket = this.io.sockets.sockets[sessionId];
                    socket.emit(socket_keys_1.default.replaceWeatherData, weatherDataToEmit);
                }
            }
            catch (error) {
                console.error(chalk.bgRed(error.message));
                console.error(chalk.red(error.stack));
            }
        }
    }
    getAllMonitoredLocations() {
        const unionedMonitoredLocations = new Set();
        for (const monitoringManager of this.monitoringDataList) {
            for (const location of monitoringManager.sessionManager.getAllMonitoredLocations()) {
                unionedMonitoredLocations.add(location);
            }
        }
        return unionedMonitoredLocations;
    }
    getAllMonitoredLocationsList() {
        const locationsSet = this.getAllMonitoredLocations();
        const locationIterator = locationsSet.values();
        const locationsList = [];
        for (let l = 0; l < locationsSet.size; l++) {
            locationsList[l] = locationIterator.next().value;
        }
        return locationsList;
    }
    retrieveAllMonitoredWeatherData() {
        process.stdout.write('');
        this.weatherClient.retrieveWeatherLocationDataList(this.getAllMonitoredLocationsList())
            .then((weatherLocationDataList) => {
            this.onWeatherLocationDataRetrieved(weatherLocationDataList);
        }).catch((error) => {
            console.error(chalk.red(error));
            console.error(chalk.red(error.stack));
        });
    }
    onSoapWeatherClientInitialised(weatherClient) {
        console.log(chalk.green('SOAP weather client created'));
        this.weatherClient = weatherClient;
        // This lets any consumers of the API know that we reset the server
        this.io.sockets.emit(socket_keys_1.default.retrievedLocations, []);
        this.io.sockets.emit(socket_keys_1.default.replaceWeatherData, []);
        // Initialise the socket.io events
        this.initialiseSocketEndpoints();
        // When SOAP Client is resolved which returns melbourneWeatherClient from an async call.
        this.successfulClientSetup = true;
        this.io.sockets.emit(socket_keys_1.default.successfulServerSetup, this.successfulClientSetup);
        // Get locations from SOAP client in melbourneWeatherClient.
        weatherClient.retrieveLocations().then((locations) => {
            this.onAllLocationsRetrieved(locations);
        });
    }
    /**
     * Runs main loop for the full lambda service via setInterval.
     */
    run() {
        // Make MelbourneWeatherClient that has a SOAP Client.
        this.weatherClientFactory.createWeatherClient()
            .then((weatherClient) => {
            this.onSoapWeatherClientInitialised(weatherClient);
        })
            .catch((error) => {
            console.error(chalk.bgRed('Failed to create SOAP client connection'));
            console.error(chalk.red(error.message));
            console.error(chalk.red(error.stack));
        });
    }
}
exports.FullLambdaService = FullLambdaService;
class MonitoringManagerData {
    constructor(sessionManager, addMonitorEventName, removeMonitorEventName) {
        this.sessionManager = sessionManager;
        this.addMonitorEventName = addMonitorEventName;
        this.removeMonitorEventName = removeMonitorEventName;
    }
}
exports.default = FullLambdaService;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Soap = __webpack_require__(18);
const chalk = __webpack_require__(0);
const MelbourneWeatherClient_1 = __webpack_require__(15);
// TODO: There are a lot of optional settings we can set in this Factory.
/**
 * Builds an async SOAP Client from the provided wsdl file.
 */
class MelbourneWeatherClientFactory {
    constructor(wdslUrl = 'http://viper.infotech.monash.edu.au:8180/axis2/services/MelbourneWeather2?wsdl') {
        this.wdslUrl = wdslUrl;
    }
    createWeatherClient() {
        return new Promise((resolve, reject) => {
            Soap.createClient(this.wdslUrl)
                .then((weatherService) => {
                // weatherService has methods defined in MelbourneWeatherServiceStub.
                const melbourneWeatherClient = new MelbourneWeatherClient_1.MelbourneWeatherClient(weatherService);
                console.log(chalk.cyan('SOAP Client created'));
                resolve(melbourneWeatherClient);
            })
                .catch((error) => {
                console.log(chalk.bgRed('Could not make SOAP Client'));
                reject(error);
            });
        });
    }
}
exports.MelbourneWeatherClientFactory = MelbourneWeatherClientFactory;
exports.default = MelbourneWeatherClientFactory;


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("socket.io");

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const SocketIo = __webpack_require__(5);
const chalk = __webpack_require__(0);
const FullLambdaService_1 = __webpack_require__(3);
const MelbourneWeatherClientFactory_1 = __webpack_require__(4);
console.log(chalk.cyan('Starting server...'));
const io = SocketIo.listen(8080);
const weatherClientFactory = new MelbourneWeatherClientFactory_1.MelbourneWeatherClientFactory();
const service = new FullLambdaService_1.FullLambdaService(io, weatherClientFactory);
service.run();


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const chalk = __webpack_require__(0);
/**
 * Provides caching mechanism so new frontend sessions that connect can display monitors instantly.
 * TODO: Maybe move to a database without changing methods for stage 2.
 */
class LocationCache {
    constructor() {
        this.locationMap = new Map();
    }
    /**
     * Add a location to map, location must not already exist in map.
     */
    addLocation(data) {
        if (this.locationMap.has(data.location)) {
            throw new Error(`location ${location} already exists in cache`);
        }
        this.locationMap.set(data.location, data);
        console.log(chalk.green(`Added location ${data.location} to cache`));
    }
    /**
     * Update a location in map, location has to previously exist in map.
     */
    updateLocation(data) {
        if (!this.locationMap.has(data.location)) {
            throw new Error(`location ${location} doesn't exist in cache, can't update`);
        }
        this.locationMap.set(data.location, data);
        console.log(chalk.green(`Updated location ${data.location} in cache`));
    }
    hasLocation(location) {
        return this.locationMap.has(location);
    }
    has(weatherData) {
        return this.locationMap.has(weatherData.location);
    }
    // Return weather data associated with a location.
    get(location) {
        return this.locationMap.get(location);
    }
}
exports.LocationCache = LocationCache;
exports.default = LocationCache;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const TimestampedData_1 = __webpack_require__(1);
/**
 * Class that represents rainfall data.
 */
class RainfallData extends TimestampedData_1.TimestampedData {
    constructor(rainfall, timestamp) {
        super(timestamp);
        this.rainfall = rainfall;
    }
}
exports.RainfallData = RainfallData;
exports.default = RainfallData;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class used to hold error to be sent to frontend after a request from the frontend.
 */
class RequestError {
    constructor(stackMessage, message) {
        this.message = message;
        this.stackMessage = stackMessage;
    }
}
exports.RequestError = RequestError;
exports.default = RequestError;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class used to hold response to be sent to consumers of the API after a request from the frontend.
 */
class RequestResponse {
    constructor(data, error) {
        this.data = data;
        this.error = error;
    }
}
exports.RequestResponse = RequestResponse;
exports.default = RequestResponse;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const TimestampedData_1 = __webpack_require__(1);
/**
 * Class that represents temperature data.
 */
class TemperatureData extends TimestampedData_1.TimestampedData {
    constructor(temperature, timestamp) {
        super(timestamp);
        this.temperature = temperature;
    }
}
exports.TemperatureData = TemperatureData;
exports.default = TemperatureData;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Controller class to monitor which locations are required to display data for, one instance for each frontend session.
 */
class LocationMonitoringManager {
    constructor() {
        this.monitoredLocations = new Map();
        // We're just going to assume that no one wants to add an observer twice, performance is more important so 
        // we're going to use a Set.
        this.onAddedMonitoredLocationObservers = new Set();
        this.onRemovedMonitoredLocationObservers = new Set();
    }
    /**
     * Gets all locations within the location monitoring manager as a set.
     */
    getMonitoredLocations() {
        const locationsSet = new Set();
        // monitoredLocations.keys() effectively returns the equivelant of Iterator<String> in Java
        // Consequently we need to add it to a new set so we can use the locations more than once.
        // That said, alternatively we could return the iterator and let the caller of the method put the 
        // locations into whatever data structure they like. That's out of scope for this assignment
        for (const monitoredLocation of this.monitoredLocations.keys()) {
            locationsSet.add(monitoredLocation);
        }
        return locationsSet;
    }
    /**
     * Adds a monitored location from the manager
     */
    addMonitorLocation(monitor) {
        if (!this.monitoredLocations.has(monitor.location)) {
            this.monitoredLocations.set(monitor.location, monitor);
            for (const onAddedMonitoredLocationObserver of this.onAddedMonitoredLocationObservers) {
                onAddedMonitoredLocationObserver.onAddedMonitoredLocation(monitor);
            }
        }
    }
    /**
     * Removes a monitored location from the manager
     */
    removeMonitoredLocation(monitor) {
        if (this.monitoredLocations.has(monitor.location)) {
            this.monitoredLocations.delete(monitor.location);
            for (const onRemovedMonitoredLocationObserver of this.onRemovedMonitoredLocationObservers) {
                onRemovedMonitoredLocationObserver.onRemovedMonitoredLocation(monitor);
            }
        }
    }
    /**
     * Adds an on add monitored location observer to the manager.
     */
    addOnAddedMonitoredLocationObserver(observer) {
        this.onAddedMonitoredLocationObservers.add(observer);
    }
    /**
     * Removes an on add monitored location observer from the manager.
     */
    removeOnAddedMonitoredLocationObserver(observer) {
        this.onAddedMonitoredLocationObservers.delete(observer);
    }
    /**
     * Adds an on remove monitored location observer from the manager.
     */
    addOnRemovedMonitoredLocationObserver(observer) {
        this.onRemovedMonitoredLocationObservers.add(observer);
    }
    /**
     * Removes an on remove monitored location observer from the manager.
     */
    removeOnRemovedMonitoredLocationObserver(observer) {
        this.onRemovedMonitoredLocationObservers.delete(observer);
    }
}
exports.LocationMonitoringManager = LocationMonitoringManager;
exports.default = LocationMonitoringManager;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Controller class to monitor all sessions, keeps track of LocationMonitorManager based on session ids.
 * Keeps track of some collective statistics of the locations being monitored like the number of sessions
 * that are tracking the location.
 */
class SessionMonitoringManager {
    constructor() {
        const that = this;
        this.monitoringSessions = new Map();
        this.sessionMonitoringLocationCounts = new Map();
        this.onAddedMonitoredLocationObserver = new class {
            onAddedMonitoredLocation(monitor) {
                if (!(monitor.location in that.sessionMonitoringLocationCounts)) {
                    that.sessionMonitoringLocationCounts.set(monitor.location, 1);
                }
                else {
                    that.incrementLocationCountFromMonitor(monitor, 1);
                }
            }
        }();
        this.onRemovedMonitoredLocationObserver = new class {
            onRemovedMonitoredLocation(monitor) {
                that.incrementLocationCountFromMonitor(monitor, -1);
            }
        }();
    }
    /**
     * Essentially an overloader method for MonitorMetadata. Unfortunately Typescript has trouble with
     * overloading methods.
     */
    incrementLocationCountFromMonitor(monitor, amountIncremented) {
        this.incrementLocationCount(monitor.location, amountIncremented);
    }
    /**
     * Increments the location count of a given location.
     */
    incrementLocationCount(monitoredLocation, amountIncremented) {
        // Get the count associated with thep provided location.
        const retrievedMonitoringCount = this.sessionMonitoringLocationCounts.get(monitoredLocation);
        // If the number was undefined then replace the value with 0.
        // Unfortunately there's no default dictionary in ECMAScript 2015 so we have to mimic the functionaltiy
        // manually.
        const sessionMonitoringLocationCount = retrievedMonitoringCount !== undefined ? retrievedMonitoringCount : 0;
        // Now set the value but with the incremented amount added in.
        this.sessionMonitoringLocationCounts.set(monitoredLocation, sessionMonitoringLocationCount + amountIncremented);
    }
    /**
     * Gets the location manager for a given session id.
     */
    getLocationMonitorManagerForSession(sessionId) {
        return this.monitoringSessions.get(sessionId);
    }
    /**
     * Adds a location manager, given a session id, into the session manager.
     */
    addMonitoringSession(sessionId, monitoringSession) {
        // Make sure that a location manager doesn't already exist.
        if (!(sessionId in this.monitoringSessions)) {
            // Good there's no location manager, let's set it to the one that we've been provided.
            this.monitoringSessions.set(sessionId, monitoringSession);
            // Now increment each count that the location manager has by 1.
            for (const monitoredLocation of monitoringSession.getMonitoredLocations().keys()) {
                this.incrementLocationCount(monitoredLocation, 1);
            }
            // Also add listeners to the location manager so we can keep track of the monitored locations count.
            monitoringSession.addOnAddedMonitoredLocationObserver(this.onAddedMonitoredLocationObserver);
            monitoringSession.addOnRemovedMonitoredLocationObserver(this.onRemovedMonitoredLocationObserver);
        }
        else {
            // The location manager already exists. Throw an error because this probably shouldn't happen.
            throw new Error(`Monitoring session with session ID ${sessionId} already exists within the session manager`);
        }
    }
    removeMonitoringSession(sessionId) {
        // Get the existing location manager.
        const monitoringSession = this.monitoringSessions.get(sessionId);
        // Check if an actual location manager actually exists.
        if (monitoringSession !== undefined) {
            // Remove the observers that we added previously.
            monitoringSession.removeOnAddedMonitoredLocationObserver(this.onAddedMonitoredLocationObserver);
            monitoringSession.removeOnRemovedMonitoredLocationObserver(this.onRemovedMonitoredLocationObserver);
            this.monitoringSessions.delete(sessionId);
            // Decrement by 1 for each location that the location manager was monitoring
            for (const monitoredLocation of monitoringSession.getMonitoredLocations().keys()) {
                this.incrementLocationCount(monitoredLocation, -1);
            }
        }
        else {
            // The location manager doesn't exist with the session manager. Throw an error.
            throw new Error(`No monitoring session with session id ${sessionId}`);
        }
    }
    /**
     * Gets the set of all locations that are actually being monitored by a location manager within the session manager.
     */
    getAllMonitoredLocations() {
        // This is the set that we're going to add the locations to.
        const monitoredLocations = new Set();
        // Go through each key in the location count.
        for (const location of this.sessionMonitoringLocationCounts.keys()) {
            const monitoringCount = this.sessionMonitoringLocationCounts.get(location);
            if (monitoringCount !== undefined) {
                if (monitoringCount > 0) {
                    monitoredLocations.add(location);
                }
            }
            else {
                // This shouldn't ever be called but if does. Throw an error.
                // A value shouldn't be undefined if there's a key that exists for the value.
                throw new Error(`Has key ${location} but count is ${monitoringCount}`);
            }
        }
        return monitoredLocations;
    }
}
exports.SessionMonitoringManager = SessionMonitoringManager;
exports.default = SessionMonitoringManager;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
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
exports.default = keys;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const chalk = __webpack_require__(0);
const RainfallData_1 = __webpack_require__(8);
const RainfallRequestData_1 = __webpack_require__(16);
const TemperatureRequestData_1 = __webpack_require__(17);
const TemperatureData_1 = __webpack_require__(11);
const WeatherLocationData_1 = __webpack_require__(2);
const LocationCache_1 = __webpack_require__(7);
/**
 * Creates a client, designed for the MelbourneWeather2 web service which listeners can be added to.
 */
class MelbourneWeatherClient {
    // Default constructor.
    constructor(melbourneWeatherSoapClient, locationCache = new LocationCache_1.LocationCache()) {
        this.weatherService = melbourneWeatherSoapClient;
        this.locationCache = locationCache;
    }
    /**
     * Retrieve locations from SOAP client endpoint.
     */
    retrieveLocations() {
        return this.weatherService.getLocations().then((locationsResponse) => {
            // locationsResponse is an object locationsResponse.return gives the data as an string.
            return locationsResponse.return;
        }).catch((error) => {
            return error;
        });
    }
    retrieveWeatherLocationData(location, getRainfall = true, getTemperature = true, forceRefresh = true) {
        if (!getRainfall && !getTemperature) {
            throw new Error('getRainfall and getTemperature were both false');
        }
        const dataPromises = [];
        let temperatureData;
        let rainfallData;
        if (!forceRefresh) {
            let cachedWeatherData;
            cachedWeatherData = this.locationCache.get(location);
            if (cachedWeatherData !== undefined) {
                rainfallData = getRainfall ? cachedWeatherData.rainfallData : null;
                temperatureData = getTemperature ? cachedWeatherData.temperatureData : null;
            }
        }
        if (getTemperature) {
            if (temperatureData === undefined) {
                const temperatureRequestPromise = this.retrieveTemperatureData(new TemperatureRequestData_1.TemperatureRequestData(location))
                    .then((retrievedTemperatureData) => {
                    temperatureData = retrievedTemperatureData;
                    return temperatureData;
                })
                    .catch((error) => {
                    console.error(chalk.bgRed('Error: retrieveTemperatureData()'));
                    console.error(chalk.red(error.message));
                    console.error(chalk.red(error.stack));
                });
                dataPromises.push(temperatureRequestPromise);
            }
        }
        if (getRainfall) {
            if (rainfallData === undefined) {
                const rainfallRequestPromise = this.retrieveRainfallData(new RainfallRequestData_1.RainfallRequestData(location))
                    .then((retrievedRainfallData) => {
                    rainfallData = retrievedRainfallData;
                    return rainfallData;
                })
                    .catch((error) => {
                    console.error(chalk.bgRed('Error: retrieveRainfallData()'));
                    console.error(chalk.red(error.message));
                    console.error(chalk.red(error.stack));
                });
                dataPromises.push(rainfallRequestPromise);
            }
        }
        // Wait for both getRainfall() and getTemperature() promises to resolve.
        return Promise.all(dataPromises)
            .then((responses) => {
            const weatherData = new WeatherLocationData_1.WeatherLocationData(location, rainfallData, temperatureData);
            if (this.locationCache.has(weatherData)) {
                this.locationCache.updateLocation(weatherData);
            }
            else {
                this.locationCache.addLocation(weatherData);
            }
            return weatherData;
        }).catch((error) => {
            console.error(chalk.bgRed('Error: Promise.all(compileWeatherLocationDataPromises)'));
            console.error(chalk.red(error.message));
            console.error(chalk.red(error.stack));
        });
    }
    /**
     * Retrieve weather data from SOAP client endpoint based on locations.
     * @param locations Locations to get data for.
     */
    retrieveWeatherLocationDataList(locations) {
        const weatherPromises = [];
        // For each location, get temp and rainfall data.
        locations.forEach((location, locationIndex) => {
            weatherPromises.push(this.retrieveWeatherLocationData(location));
        });
        return Promise.all(weatherPromises);
    }
    /**
     * Accesses SOAP Client to get rainfall data. Returns a promise.
     * Upon successful completion, returns rainfallStrings (parsed from the rainfallResponse).
     * rainfallStrings is of form 'timestamp,rainfall in mm'.
     * It can be accessed with a outer .then() propagating it up.
     */
    retrieveRainfallData(rainfallRequestData) {
        // Note: SOAP lib is async, Promise.then to do work after async call.
        return this.weatherService.getRainfall(rainfallRequestData)
            .then((rainfallResponse) => {
            // rainfallResponse is an object, .return will return the data in that object as a string[].
            const rainfallStrings = rainfallResponse.return;
            return new RainfallData_1.RainfallData(rainfallStrings[1], rainfallStrings[0]);
        })
            .catch((error) => {
            console.error(chalk.bgRed('Error: getRainfall()'));
            console.error(chalk.red(error.message));
            console.error(chalk.red(error.stack));
        });
    }
    /**
     * Accesses SOAP Client to get temperature data. Returns a promise.
     * Upon successful completion, returns temperatureStrings (parsed from the temperatureResponse).
     * temperatureStrings is of form 'timestamp,temperature in degrees celsius'.
     * It can be accessed with a outer .then() propagating it up.
     */
    retrieveTemperatureData(temperatureRequestData) {
        return this.weatherService.getTemperature(temperatureRequestData)
            .then((temperatureResponse) => {
            const temperatureStrings = temperatureResponse.return;
            return new TemperatureData_1.TemperatureData(temperatureStrings[1], temperatureStrings[0]);
        })
            .catch((error) => {
            console.error(chalk.bgRed('Error: getTemperature()'));
            console.error(chalk.red(error.message));
            console.error(chalk.red(error.stack));
        });
    }
}
exports.MelbourneWeatherClient = MelbourneWeatherClient;
exports.default = MelbourneWeatherClient;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class to hold data to be sent to SOAP client to retrieve rainfall data.
 */
class RainfallRequestData {
    constructor(parameters) {
        this.parameters = parameters;
    }
}
exports.RainfallRequestData = RainfallRequestData;
exports.default = RainfallRequestData;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class to hold data to be sent to SOAP client to retrieve temperature data.
 */
class TemperatureRequestData {
    constructor(parameters) {
        this.parameters = parameters;
    }
}
exports.TemperatureRequestData = TemperatureRequestData;
exports.default = TemperatureRequestData;


/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = require("soap-as-promised");

/***/ })
/******/ ]);
//# sourceMappingURL=backend-compiled-debug.js.map