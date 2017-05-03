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
const LocationMonitoringManager_1 = __webpack_require__(11);
const RequestError_1 = __webpack_require__(8);
const RequestResponse_1 = __webpack_require__(9);
const SessionMonitoringManager_1 = __webpack_require__(12);
const WeatherLocationData_1 = __webpack_require__(2);
const socket_keys_1 = __webpack_require__(13);
// TODO: Consider if having soft dependencies on Temp & Rainfall & their request data types is better
// allows for dependency injection where you pass in req parameters.
// 300000 milliseconds = 5 mins.
const defaultWeatherPollingInterval = 5000;
class MonitoringManagerData {
    constructor(sessionManager, addMonitorEventName, removeMonitorEventName) {
        this.sessionManager = sessionManager;
        this.addMonitorEventName = addMonitorEventName;
        this.removeMonitorEventName = removeMonitorEventName;
    }
}
/**
 * Controller class instantiated by the node server.
 */
class FullLambdaService {
    constructor(io, weatherClientFactory) {
        this.successfulClientSetup = false;
        this.melbourneWeatherLocations = [];
        this.io = io;
        this.weatherClientFactory = weatherClientFactory;
        this.rainfallMonitoringData = new MonitoringManagerData(new SessionMonitoringManager_1.SessionMonitoringManager(), socket_keys_1.default.addRainfallMonitor, socket_keys_1.default.removeRainfallMonitor);
        this.temperatureMonitoringData = new MonitoringManagerData(new SessionMonitoringManager_1.SessionMonitoringManager(), socket_keys_1.default.addTemperatureMonitor, socket_keys_1.default.removeTemperatureMonitor);
        this.monitoringDataList = [
            this.rainfallMonitoringData,
            this.temperatureMonitoringData
        ];
    }
    /**
     * Setup websocket endpoints using SocketIO.
     */
    initialiseSocketEndpoints() {
        this.io.sockets.on('connection', (socket) => {
            // Called when session started with frontend.
            const sessionId = socket.id;
            console.log(`Session started ${sessionId}`);
            socket.emit(socket_keys_1.default.retrievedLocations, this.melbourneWeatherLocations);
            socket.emit(socket_keys_1.default.replaceWeatherData, []);
            // Add MonitoringManagerData to manage session with front end client.
            for (const monitoringManager of this.monitoringDataList) {
                monitoringManager.sessionManager.addMonitoringSession(sessionId, new LocationMonitoringManager_1.LocationMonitoringManager());
                this.initialiseMonitorSocketEvent(socket, monitoringManager.addMonitorEventName, monitoringManager.removeMonitorEventName, monitoringManager.sessionManager);
            }
            socket.on('disconnect', () => {
                console.log(`Session ended: ${sessionId}`);
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
        setInterval(() => { this.retrieveAllMonitoredWeatherData(); }, defaultWeatherPollingInterval);
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
                    if (monitoringSession.sessionManager.getMonitoredLocations().size > 0) {
                        hasDataToEmit = true;
                        break;
                    }
                }
                if (!hasDataToEmit) {
                    console.log(`Session ID ${chalk.magenta(sessionId)} wasn't monitoring anything, skipping emission.`);
                    continue;
                }
                const rainfallToEmitWeatherFor = this.rainfallMonitoringData.sessionManager.getMonitoredLocations();
                const temperatureToEmitWeatherFor = this.temperatureMonitoringData.sessionManager.getMonitoredLocations();
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
            for (const location of monitoringManager.sessionManager.getMonitoredLocations()) {
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
exports.default = FullLambdaService;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const TestWeatherClient_1 = __webpack_require__(14);
/**
 * Creates offline test enviornment test clients
 */
class TestWeatherClientFactory {
    createWeatherClient() {
        return new Promise((resolve, reject) => {
            resolve(new TestWeatherClient_1.TestWeatherClient());
        });
    }
}
exports.TestWeatherClientFactory = TestWeatherClientFactory;
exports.default = TestWeatherClientFactory;


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
const TestWeatherClientFactory_1 = __webpack_require__(4);
console.log(chalk.cyan('Starting test server...'));
new FullLambdaService_1.FullLambdaService(SocketIo.listen(8080), new TestWeatherClientFactory_1.TestWeatherClientFactory()).run();


/***/ }),
/* 7 */
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
/* 8 */
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
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class used to hold response to be sent to frontend after a request from the frontend.
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
/* 10 */
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
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Controller class to monitor which locations are required to display data for, one instance for each frontend session.
 */
class LocationMonitoringManager {
    constructor() {
        this.monitoredLocations = new Map();
        this.onAddedMonitoredLocationObservers = new Set();
        this.onRemovedMonitoredLocationObservers = new Set();
    }
    getMonitoredLocations() {
        const locationsSet = new Set();
        // monitoredLocations.keys() effectively returns the equivelant of Iterator<String> in Java
        for (const monitoredLocation of this.monitoredLocations.keys()) {
            locationsSet.add(monitoredLocation);
        }
        return locationsSet;
    }
    addMonitorLocation(monitor) {
        if (!this.monitoredLocations.has(monitor.location)) {
            this.monitoredLocations.set(monitor.location, monitor);
            for (const onAddedMonitoredLocationObserver of this.onAddedMonitoredLocationObservers) {
                onAddedMonitoredLocationObserver.onAddedMonitoredLocation(monitor);
            }
        }
    }
    removeMonitoredLocation(monitor) {
        if (this.monitoredLocations.has(monitor.location)) {
            this.monitoredLocations.delete(monitor.location);
            for (const onRemovedMonitoredLocationObserver of this.onRemovedMonitoredLocationObservers) {
                onRemovedMonitoredLocationObserver.onRemovedMonitoredLocation(monitor);
            }
        }
    }
    addOnAddedMonitoredLocationObserver(observer) {
        this.onAddedMonitoredLocationObservers.add(observer);
    }
    removeOnAddedMonitoredLocationObserver(observer) {
        this.onAddedMonitoredLocationObservers.delete(observer);
    }
    addOnRemovedMonitoredLocationObserver(observer) {
        this.onRemovedMonitoredLocationObservers.add(observer);
    }
    removeOnRemovedMonitoredLocationObserver(observer) {
        this.onRemovedMonitoredLocationObservers.delete(observer);
    }
}
exports.LocationMonitoringManager = LocationMonitoringManager;
exports.default = LocationMonitoringManager;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Controller class to monitor all sessions, keeps track of LocationMonitorManager based on session ids.
 */
class SessionMonitoringManager {
    constructor() {
        this.monitoringSessions = new Map();
        this.sessionMonitoringLocationCounts = new Map();
        const that = this;
        this.onAddedMonitoredLocationObserver = new class {
            onAddedMonitoredLocation(monitor) {
                that.addMonitoredLocation(monitor);
            }
        }();
        this.onRemovedMonitoredLocationObserver = new class {
            onRemovedMonitoredLocation(monitor) {
                that.removeMonitoredLocation(monitor);
            }
        }();
    }
    incrementLocationCountFromMonitor(monitor, amountIncremented) {
        this.incrementLocationCount(monitor.location, amountIncremented);
    }
    incrementLocationCount(monitoredLocation, amountIncremented) {
        const retrievedMonitoringCount = this.sessionMonitoringLocationCounts.get(monitoredLocation);
        const sessionMonitoringLocationCount = retrievedMonitoringCount !== undefined ? retrievedMonitoringCount : 0;
        this.sessionMonitoringLocationCounts.set(monitoredLocation, sessionMonitoringLocationCount + amountIncremented);
    }
    getLocationMonitorManagerForSession(sessionId) {
        return this.monitoringSessions.get(sessionId);
    }
    addMonitoringSession(sessionId, monitoringSession) {
        if (!(sessionId in this.monitoringSessions)) {
            this.monitoringSessions.set(sessionId, monitoringSession);
            for (const monitoredLocation of monitoringSession.getMonitoredLocations().keys()) {
                this.incrementLocationCount(monitoredLocation, 1);
            }
            monitoringSession.addOnAddedMonitoredLocationObserver(this.onAddedMonitoredLocationObserver);
            monitoringSession.addOnRemovedMonitoredLocationObserver(this.onRemovedMonitoredLocationObserver);
        }
        else {
            throw new Error(`Monitoring session with session ID ${sessionId} already exists within the session manager`);
        }
    }
    removeMonitoringSession(sessionId) {
        const monitoringSession = this.monitoringSessions.get(sessionId);
        if (monitoringSession) {
            monitoringSession.removeOnAddedMonitoredLocationObserver(this.onAddedMonitoredLocationObserver);
            monitoringSession.removeOnRemovedMonitoredLocationObserver(this.onRemovedMonitoredLocationObserver);
            this.monitoringSessions.delete(sessionId);
            for (const monitoredLocation of monitoringSession.getMonitoredLocations().keys()) {
                this.incrementLocationCount(monitoredLocation, -1);
            }
        }
        else {
            throw new Error(`No monitoring session with session id ${sessionId}`);
        }
    }
    getMonitoredLocations() {
        const monitoredLocations = new Set();
        for (const location of this.sessionMonitoringLocationCounts.keys()) {
            const monitoringCount = this.sessionMonitoringLocationCounts.get(location);
            console.log(`${location} has ${monitoringCount} sessions monitoring it.`);
            if (monitoringCount !== undefined) {
                if (monitoringCount > 0) {
                    monitoredLocations.add(location);
                }
            }
            else {
                throw new Error(`Has key ${location} but count is ${monitoringCount}`);
            }
        }
        return monitoredLocations;
    }
    removeMonitoredLocation(monitor) {
        this.incrementLocationCountFromMonitor(monitor, -1);
    }
    addMonitoredLocation(monitor) {
        if (!(monitor.location in this.sessionMonitoringLocationCounts)) {
            this.sessionMonitoringLocationCounts.set(monitor.location, 1);
        }
        else {
            this.incrementLocationCountFromMonitor(monitor, 1);
        }
    }
}
exports.SessionMonitoringManager = SessionMonitoringManager;
exports.default = SessionMonitoringManager;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const keys = {
    addRainfallMonitor: 'add_rainfall_monitor',
    addTemperatureMonitor: 'add_temperature_monitor',
    removeRainfallMonitor: 'remove_rainfall_monitor',
    removeTemperatureMonitor: 'remove_temperature_monitor',
    replaceWeatherData: 'replace_weather_data',
    retrievedLocations: 'locations',
    successfulServerSetup: 'successful_server_setup'
};
exports.default = keys;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const WeatherLocationData_1 = __webpack_require__(2);
const RainfallData_1 = __webpack_require__(7);
const TemperatureData_1 = __webpack_require__(10);
/**
 * Sometimes the SOAP API is down so we needed to create an extra client so that we could use offline dummy data
 * while we wait for the SOAP API to turn on again.
 * On top of that we also have needed to run tests independant of the SOAP client.
 */
class TestWeatherClient {
    constructor() {
        this.pollCount = 0;
        setInterval(() => {
            this.pollCount += 1;
        }, 500);
    }
    createDummyRainfallData(location, forceRefresh) {
        return new RainfallData_1.RainfallData(`Rainfall ${location}, ${this.pollCount} (Forced refresh: ${forceRefresh})`, `Rainfall timestamp ${new Date().toString()}`);
    }
    createDummyTemperatureData(location, forceRefresh) {
        return new TemperatureData_1.TemperatureData(`Temperature ${location}, ${this.pollCount} (Forced refresh: ${forceRefresh})`, `Temperature timestamp ${new Date().toString()}`);
    }
    retrieveLocations() {
        return new Promise((resolve, reject) => {
            const dummyLocations = [];
            for (let l = 0; l < 15; l++) {
                dummyLocations.push(`Location ${l}`);
            }
            resolve(dummyLocations);
        });
    }
    retrieveWeatherLocationData(location, getRainfall = true, getTemperature = true, forceRefresh = true) {
        return new Promise((resolve, reject) => {
            resolve(new WeatherLocationData_1.WeatherLocationData(location, getRainfall ? this.createDummyRainfallData(location, forceRefresh) : null, getTemperature ? this.createDummyTemperatureData(location, forceRefresh) : null));
        });
    }
    retrieveWeatherLocationDataList(locations) {
        return new Promise((resolve, reject) => {
            const weatherPromises = [];
            for (const location of locations) {
                weatherPromises.push(this.retrieveWeatherLocationData(location));
            }
            resolve(Promise.all(weatherPromises));
        });
    }
}
exports.TestWeatherClient = TestWeatherClient;
exports.default = TestWeatherClient;


/***/ })
/******/ ]);
//# sourceMappingURL=backend-compiled-debug.js.map