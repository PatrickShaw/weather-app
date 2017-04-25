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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const Soap = __webpack_require__(6);
const index_1 = __webpack_require__(5);
/**
 * Creates a   client, designed for the MelbourneWeatherApi.
 */
class MelbourneWeatherClient {
    constructor(melbourneWeatherSoapClient) {
        this.weatherService = melbourneWeatherSoapClient;
        this.onWeatherPollCompleteListeners = [];
        this.onLocationsPollCompleteListeners = [];
    }
    addOnWeatherRetrievedListener(addedListener) {
        this.onWeatherPollCompleteListeners.push(addedListener);
    }
    removeOnWeatherRetrievedListener(removedListener) {
        this.onWeatherPollCompleteListeners.filter(listener => {
            return listener !== removedListener;
        });
    }
    addOnLocationsRetrievedListener(addedListener) {
        this.onLocationsPollCompleteListeners.push(addedListener);
    }
    removeOnLocationsRetrievedListener(removedListener) {
        this.onLocationsPollCompleteListeners.filter(listener => {
            return listener !== removedListener;
        });
    }
    retrieveLocations() {
        this.weatherService.getLocations(null).then(locationsResponse => {
            let locations = locationsResponse.return;
            this.onLocationsPollCompleteListeners.forEach(onLocationsPollCompleteListener => {
                onLocationsPollCompleteListener.onLocationsRetrieved(locations);
            });
        });
    }
    retrieveWeatherData(locations) {
        let weatherLocationDataList = [];
        let weatherPromises = [];
        locations.forEach(location => {
            let temperatureData;
            let rainfallData;
            const temperatureRequestPromise = this.weatherService.getRainfall({ parameters: location }).then(temperatureResponse => {
                let temperatureStrings = temperatureResponse.return;
                temperatureData = new index_1.TemperatureData(temperatureStrings[0], temperatureStrings[1]);
            });
            const rainfallRequestPromise = this.weatherService.getTemperature({ parameters: location }).then(rainfallResponse => {
                let rainfallStrings = rainfallResponse.return;
                rainfallData = new index_1.RainfallData(rainfallStrings[0], rainfallStrings[1]);
            });
            let compileWeatherLocationDataPromises = [temperatureRequestPromise, rainfallRequestPromise];
            Promise.all(compileWeatherLocationDataPromises).then(responses => {
                let weatherData = new index_1.WeatherLocationData(location, rainfallData, temperatureData);
                weatherLocationDataList.push(weatherData);
            });
            weatherPromises.push(rainfallRequestPromise);
            weatherPromises.push(temperatureRequestPromise);
        });
        Promise.all(weatherPromises).then(responses => {
            this.onWeatherPollCompleteListeners.forEach(onWeatherPollCompleteListener => {
                onWeatherPollCompleteListener.onWeatherRetrieved(weatherLocationDataList);
            });
        });
    }
}
exports.MelbourneWeatherClient = MelbourneWeatherClient;
// TODO: There are a lot of optional settings we can set in this builder
class Builder {
    build() {
        return new Promise((resolve, reject) => {
            Soap.createClient('http://viper.infotech.monash.edu.au:8180/axis2/services/MelbourneWeather2?wsdl').then(weatherService => {
                let melbourneWeatherClient = new MelbourneWeatherClient(weatherService);
                resolve(melbourneWeatherClient);
            }).catch(error => {
                reject(error);
            });
        });
    }
}
exports.Builder = Builder;
exports.default = MelbourneWeatherClient;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const MelbourneWeatherClient_1 = __webpack_require__(0);
new MelbourneWeatherClient_1.Builder().build().then(melbourneWeatherClient => {
    melbourneWeatherClient.addOnWeatherRetrievedListener(new class {
        onWeatherRetrieved(weatherLocationDataList) {
            console.log(weatherLocationDataList);
        }
    }());
    melbourneWeatherClient.addOnLocationsRetrievedListener(new class {
        onLocationsRetrieved(locations) {
            console.log(locations);
            setInterval(() => {
                melbourneWeatherClient.retrieveWeatherData(locations);
            }, 5000);
        }
    }());
    melbourneWeatherClient.retrieveLocations();
});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
class RainfallData {
    constructor(rainfall, timestamp) {
        this.rainfall = rainfall;
        this.timestamp = timestamp;
    }
}
exports.RainfallData = RainfallData;
exports.default = RainfallData;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
class TemperatureData {
    constructor(temperature, timestamp) {
        this.temperature = temperature;
        this.timestamp = timestamp;
    }
}
exports.TemperatureData = TemperatureData;
exports.default = TemperatureData;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
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
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const TemperatureData_1 = __webpack_require__(3);
exports.TemperatureData = TemperatureData_1.TemperatureData;
const RainfallData_1 = __webpack_require__(2);
exports.RainfallData = RainfallData_1.RainfallData;
const WeatherLocationData_1 = __webpack_require__(4);
exports.WeatherLocationData = WeatherLocationData_1.WeatherLocationData;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("soap-as-promised");

/***/ })
/******/ ]);
//# sourceMappingURL=backend-compiled-debug.js.map