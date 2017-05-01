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
const chalk = __webpack_require__(0);
const LocationCache_1 = __webpack_require__(5);
const LocationMonitoringManager_1 = __webpack_require__(14);
const RequestError_1 = __webpack_require__(9);
const RequestResponse_1 = __webpack_require__(10);
const SessionMonitoringManager_1 = __webpack_require__(15);
const socket_keys_1 = __webpack_require__(16);
// TODO: Consider if having soft dependencies on Temp & Rainfall & their request data types is better
// allows for dependency injection where you pass in req parameters.
/**
 * Controller class instantiated by the node server.
 */
class FullLambdaService {
    constructor(io, weatherClientFactory, sessionManager = new SessionMonitoringManager_1.SessionMonitoringManager()) {
        // All locations retrieved from SOAP client.
        this.melbourneWeatherLocations = [];
        this.locationCache = new LocationCache_1.LocationCache();
        this.succesfulSoapClientconnection = false;
        this.melbourneWeatherLocations = [];
        this.sessionManager = sessionManager;
        this.io = io;
        this.weatherClientFactory = weatherClientFactory;
    }
    /**
     * Setup websocket endpoints using SocketIO.
     */
    initialiseSocketEndpoints() {
        this.io.sockets.on('connection', (socket) => {
            // Called when session started with frontend.
            const sessionId = socket.id;
            console.log(`Session started ${sessionId}`);
            // Add MonitoringManager to manage session with front end client.
            this.sessionManager.addMonitoringSession(sessionId, new LocationMonitoringManager_1.LocationMonitoringManager());
            if (this.melbourneWeatherLocations.length > 0) {
                // Send off locations from SOAP client.
                socket.emit(socket_keys_1.default.retrievedLocations, this.melbourneWeatherLocations);
            }
            socket.on(socket_keys_1.default.addMonitor, (monitor) => {
                try {
                    // Frontend sessions wants to monitor another location.
                    // monitor is a string that is a location.
                    const locationMonitoringManager = this.sessionManager.getLocationMonitorManagerForSession(sessionId);
                    if (locationMonitoringManager) {
                        console.log(`Session ID ${chalk.magenta(sessionId)} added monitor ${chalk.magenta(monitor.location)}`);
                        // Can add monitor.
                        // Add new location to monitor to all locations that are monitored.
                        locationMonitoringManager.addMonitorLocation(monitor);
                        if (this.locationCache.has(monitor.location)) {
                            socket.emit(socket_keys_1.default.addMonitor, new RequestResponse_1.RequestResponse(this.locationCache.get(monitor.location), null));
                        }
                        else {
                            this.weatherClient.retrieveWeatherLocationData(monitor.location, true, true)
                                .then((weatherLocationData) => {
                                socket.emit(socket_keys_1.default.addMonitor, new RequestResponse_1.RequestResponse(weatherLocationData, null));
                            }).catch((error) => {
                                console.log(chalk.red(error.message));
                                console.log(chalk.red(error.stack));
                            });
                        }
                    }
                    else {
                        // Can't add monitor.
                        console.error(`${chalk.red('Could add monitor. No session for ID: ')}${chalk.magenta(sessionId)}`);
                        const requestError = new RequestError_1.RequestError(`Could add monitor ${monitor}.`, `No session for ID: ' ${sessionId}`);
                        const response = new RequestResponse_1.RequestResponse(null, requestError);
                        socket.emit(socket_keys_1.default.addMonitor, response);
                    }
                }
                catch (error) {
                    const requestError = new RequestError_1.RequestError(`Failed to add monitor for location ${monitor}`, error.message);
                    const response = new RequestResponse_1.RequestResponse(null, requestError);
                    console.error(chalk.red(error.message));
                    console.error(chalk.red(error.stack));
                    socket.emit(socket_keys_1.default.addMonitor, response);
                }
            });
            socket.on(socket_keys_1.default.removeMonitor, (monitor) => {
                // monitor is a string that is a location.
                // Frontend emitted remove_monitor with MonitorMetadata.
                try {
                    // Note: | means can be type_a or type_b where type_a | type_b.
                    const locationMonitoringManager = this.sessionManager.getLocationMonitorManagerForSession(sessionId);
                    if (locationMonitoringManager) {
                        console.log(`Session ID ${chalk.magenta(sessionId)} removed monitor ${chalk.magenta(monitor.location)}`);
                        // Can remove location.
                        locationMonitoringManager.removeMonitoredLocation(monitor);
                        socket.emit(socket_keys_1.default.removeMonitor, new RequestResponse_1.RequestResponse(monitor, null));
                    }
                    else {
                        // Can't remove location.
                        console.error(`${chalk.red('Could remove monitor. No session for ID: ')}${chalk.magenta(sessionId)}`);
                        const requestError = new RequestError_1.RequestError(`Could remove monitor ${monitor}.`, `No session for ID: ' ${sessionId}`);
                        const response = new RequestResponse_1.RequestResponse(null, requestError);
                        socket.emit(socket_keys_1.default.removeMonitor, response);
                    }
                }
                catch (error) {
                    const requestError = new RequestError_1.RequestError(`Failed to remove monitor for location ${monitor}`, error.message);
                    const response = new RequestResponse_1.RequestResponse(null, requestError);
                    console.log(chalk.red(error.message));
                    console.log(chalk.red(error.stack));
                    socket.emit(socket_keys_1.default.removeMonitor, response);
                }
            });
            socket.on('disconnect', () => {
                console.log(`Session ended: ${sessionId}`);
                this.sessionManager.removeMonitoringSession(sessionId);
            });
            // Emit to front end whether the SOAP Client was successfully created.
            this.io.emit(socket_keys_1.default.soapClientCreationSuccess, this.succesfulSoapClientconnection);
        });
    }
    onAllLocationsRetrieved(locations) {
        // Retrieves all locations from SOAP client points.
        // Only called once, under the assumption locations are set.
        this.melbourneWeatherLocations = locations.sort();
        // Send locations to front end.
        this.io.sockets.emit(socket_keys_1.default.retrievedLocations, locations);
        console.log(chalk.cyan(`locations: ${locations}`));
        // setInterval() is a JavaScript method that runs the method every msInterval milliseconds.
        // 300000 milliseconds = 5 mins.
        const msInterval = 5000;
        // TODO: Fix so data populated once a session is connected, cache it.
        // Note: setInterval() doesn't get data at time 0.
        this.retrieveAllMonitoredWeatherData();
        setInterval(() => { this.retrieveAllMonitoredWeatherData(); }, msInterval);
    }
    onWeatherLocationDataRetrieved(weatherLocationDataList) {
        console.log(weatherLocationDataList);
        // Logs timestamp and weatherLocationDataList in backend before sending data to frontend.
        // Send updated data to front end.
        const timeStamp = new Date().toString();
        console.log(`${chalk.green('Retrieved weather data at time: ')}${timeStamp}`);
        for (const weatherData of weatherLocationDataList) {
            this.locationCache.setLocation(weatherData.location, weatherData);
        }
        // Note: sockets.sockets is a Socket IO library attribute.
        for (const sessionId of Object.keys(this.io.sockets.sockets)) {
            try {
                console.info(`Getting monitoring session for session ID: ${chalk.magenta(sessionId)}`);
                const monitoringSession = this.sessionManager.getLocationMonitorManagerForSession(sessionId);
                if (monitoringSession) {
                    const locationsToEmitWeatherFor = monitoringSession.getMonitoredLocations();
                    // We only need to emit data if the user is monitoring a location.
                    // Otherwise don't even bother executing the emission code.
                    if (locationsToEmitWeatherFor.size > 0) {
                        const weatherDataToEmit = [];
                        for (const weatherData of weatherLocationDataList) {
                            if (locationsToEmitWeatherFor.has(weatherData.location)) {
                                weatherDataToEmit.push(weatherData);
                            }
                        }
                        const socket = this.io.sockets.sockets[sessionId];
                        socket.emit(socket_keys_1.default.replaceWeatherData, weatherDataToEmit);
                    }
                    else {
                        console.log(`Session ID ${chalk.magenta(sessionId)} wasn't monitoring anything, skipping emission.`);
                    }
                }
                else {
                    console.error(chalk.red(`Socket ${chalk.magenta(sessionId)} had no monitoring session. Skipping emit.`));
                }
            }
            catch (error) {
                console.error(chalk.bgRed(error.message));
                console.error(chalk.red(error.stack));
            }
        }
    }
    retrieveAllMonitoredWeatherData() {
        this.weatherClient.retrieveWeatherLocationDataList(this.sessionManager.getMonitoredLocations())
            .then((weatherLocationDataList) => {
            this.onWeatherLocationDataRetrieved(weatherLocationDataList);
        }).catch((error) => {
            console.log(chalk.red(error));
            console.log(chalk.red(error.stack));
        });
    }
    /**
     * Runs main loop for the full lambda service via setInterval.
     */
    run() {
        this.initialiseSocketEndpoints();
        // Make MelbourneWeatherClient that has a SOAP Client.
        this.weatherClientFactory.createWeatherClient()
            .then((weatherClient) => {
            this.weatherClient = weatherClient;
            console.log(chalk.green('SOAP Client created'));
            // When SOAP Client is resolved which returns melbourneWeatherClient from an async call.
            this.succesfulSoapClientconnection = true;
            this.io.emit(socket_keys_1.default.soapClientCreationSuccess, this.succesfulSoapClientconnection);
            // Get locations from SOAP client in melbourneWeatherClient.
            weatherClient.retrieveLocations().then((locations) => {
                this.onAllLocationsRetrieved(locations);
            });
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
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const TestWeatherClient_1 = __webpack_require__(17);
/**
 *
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
/* 4 */
/***/ (function(module, exports) {

module.exports = require("socket.io");

/***/ }),
/* 5 */
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
    addLocation(location, data) {
        if (this.locationMap.has(location)) {
            throw new Error(`location ${location} already exists in ${this.locationMap}`);
        }
        this.locationMap.set(location, data);
        console.log(chalk.red(`Add location ${location} to cache`));
    }
    /**
     * Update a location in map, location has to previously exist in map.
     */
    updateLocation(location, data) {
        if (!this.locationMap.has(location)) {
            throw new Error(`location ${location} doesn't exist in ${this.locationMap}, can't update`);
        }
        this.locationMap.set(location, data);
        console.log(chalk.red(`Update location ${location} in cache`));
    }
    /**
     * If location is not in map will add, else updates.
     */
    setLocation(location, data) {
        this.locationMap.set(location, data);
        console.log(chalk.cyan(`Set location ${location} in cache`));
    }
    has(location) {
        return this.locationMap.has(location);
    }
    // Return weather data associated with a location.
    get(location) {
        return this.locationMap.get(location);
    }
}
exports.LocationCache = LocationCache;
exports.default = LocationCache;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const SocketIo = __webpack_require__(4);
const chalk = __webpack_require__(0);
const FullLambdaService_1 = __webpack_require__(2);
const TestWeatherClientFactory_1 = __webpack_require__(3);
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
        if (rainfall === '') {
            // Handle no data from SOAP client.
            this.rainfall = 'N/A';
        }
        else {
            this.rainfall = rainfall;
        }
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
        if (temperature === '') {
            this.temperature = 'N/A';
        }
        else {
            this.temperature = temperature;
        }
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
/* 13 */
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
/* 14 */
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
/* 15 */
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
        console.assert(!(sessionId in this.monitoringSessions), `Monitoring session with session ID ${sessionId} already exists within the session manager`);
        this.monitoringSessions.set(sessionId, monitoringSession);
        for (const monitoredLocation of monitoringSession.getMonitoredLocations().keys()) {
            this.incrementLocationCount(monitoredLocation, 1);
        }
        monitoringSession.addOnAddedMonitoredLocationObserver(this.onAddedMonitoredLocationObserver);
        monitoringSession.addOnRemovedMonitoredLocationObserver(this.onRemovedMonitoredLocationObserver);
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
        const monitoredLocations = [];
        for (const location of this.sessionMonitoringLocationCounts.keys()) {
            const monitoringCount = this.sessionMonitoringLocationCounts.get(location);
            console.log(`${location} has ${monitoringCount} sessions monitoring it.`);
            if (monitoringCount !== undefined) {
                if (monitoringCount > 0) {
                    monitoredLocations.push(location);
                }
            }
            else {
                throw new Error(`Has key ${location} but count is ${monitoringCount}`);
            }
        }
        monitoredLocations.sort();
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
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const keys = {
    addMonitor: 'add_monitor',
    removeMonitor: 'remove_monitor',
    replaceWeatherData: 'replace_weather_data',
    retrievedLocations: 'locations',
    soapClientCreationSuccess: 'soap_client_creation_success'
};
exports.default = keys;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const WeatherLocationData_1 = __webpack_require__(13);
const RainfallData_1 = __webpack_require__(7);
const TemperatureData_1 = __webpack_require__(11);
const RainfallRequestData_1 = __webpack_require__(8);
const TemperatureRequestData_1 = __webpack_require__(12);
/**
 * Sometimes the SOAP API is down so we needed to create an extra client so that we could use offline dummy data
 * while we wait for the SOAP API to turn on again.
 * On top of that we also have needed to run tests independant of the SOAP client.
 */
class TestWeatherClient {
    createDummyRainfallData(rainfallRequestData) {
        return new RainfallData_1.RainfallData(`Rainfall ${rainfallRequestData.parameters}`, `Rainfall timestamp ${new Date().toString()}`);
    }
    createDummyTemperatureData(temperatureRequestData) {
        return new TemperatureData_1.TemperatureData(`Temperature ${temperatureRequestData.parameters}`, `Temperature timestamp ${new Date().toString()}`);
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
    retrieveWeatherLocationData(location, getRainfall, getTemperature) {
        return new Promise((resolve, reject) => {
            resolve(new WeatherLocationData_1.WeatherLocationData(location, this.createDummyRainfallData(new RainfallRequestData_1.RainfallRequestData(location)), this.createDummyTemperatureData(new TemperatureRequestData_1.TemperatureRequestData(location))));
        });
    }
    retrieveRainfallData(rainfallRequestData) {
        return new Promise((resolve, reject) => {
            resolve(this.createDummyRainfallData(rainfallRequestData));
        });
    }
    retrieveTemperatureData(temperatureRequestData) {
        return new Promise((resolve, reject) => {
            resolve(this.createDummyTemperatureData(temperatureRequestData));
        });
    }
    retrieveWeatherLocationDataList(locations) {
        return new Promise((resolve, reject) => {
            const dummyLocationData = [];
            for (const location of locations) {
                dummyLocationData.push(new WeatherLocationData_1.WeatherLocationData(location, this.createDummyRainfallData(new RainfallRequestData_1.RainfallRequestData(location)), this.createDummyTemperatureData(new TemperatureRequestData_1.TemperatureRequestData(location))));
            }
            resolve(dummyLocationData);
        });
    }
}
exports.TestWeatherClient = TestWeatherClient;
exports.default = TestWeatherClient;


/***/ })
/******/ ]);
//# sourceMappingURL=backend-compiled-debug.js.map