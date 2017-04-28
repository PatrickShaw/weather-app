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
var Soap = __webpack_require__(6);
var index_1 = __webpack_require__(5);
/**
 * Creates a client, designed for the MelbourneWeatherApi.
 */
var MelbourneWeatherClient = (function () {
    function MelbourneWeatherClient(melbourneWeatherSoapClient) {
        this.weatherService = melbourneWeatherSoapClient;
        this.onWeatherPollCompleteListeners = [];
        this.onLocationsPollCompleteListeners = [];
    }
    MelbourneWeatherClient.prototype.addOnWeatherRetrievedListener = function (addedListener) {
        this.onWeatherPollCompleteListeners.push(addedListener);
    };
    MelbourneWeatherClient.prototype.removeOnWeatherRetrievedListener = function (removedListener) {
        this.onWeatherPollCompleteListeners.filter(function (listener) {
            return listener !== removedListener;
        });
    };
    MelbourneWeatherClient.prototype.addOnLocationsRetrievedListener = function (addedListener) {
        this.onLocationsPollCompleteListeners.push(addedListener);
    };
    MelbourneWeatherClient.prototype.removeOnLocationsRetrievedListener = function (removedListener) {
        this.onLocationsPollCompleteListeners.filter(function (listener) {
            return listener !== removedListener;
        });
    };
    MelbourneWeatherClient.prototype.retrieveLocations = function () {
        var _this = this;
        this.weatherService.getLocations(null)
            .then(function (locationsResponse) {
            var locations = locationsResponse.return;
            _this.onLocationsPollCompleteListeners.forEach(function (onLocationsPollCompleteListener) {
                onLocationsPollCompleteListener.onLocationsRetrieved(locations);
            });
        });
    };
    MelbourneWeatherClient.prototype.retrieveWeatherData = function (locations) {
        var _this = this;
        var weatherLocationDataList = [];
        var weatherPromises = [];
        locations.forEach(function (location) {
            var temperatureData;
            var rainfallData;
            var temperatureRequestPromise = _this.weatherService.getRainfall({ parameters: location })
                .then(function (temperatureResponse) {
                var temperatureStrings = temperatureResponse.return;
                temperatureData = new index_1.TemperatureData(temperatureStrings[0], temperatureStrings[1]);
            });
            var rainfallRequestPromise = _this.weatherService.getTemperature({ parameters: location })
                .then(function (rainfallResponse) {
                var rainfallStrings = rainfallResponse.return;
                rainfallData = new index_1.RainfallData(rainfallStrings[0], rainfallStrings[1]);
            });
            var compileWeatherLocationDataPromises = [temperatureRequestPromise, rainfallRequestPromise];
            Promise.all(compileWeatherLocationDataPromises)
                .then(function (responses) {
                var weatherData = new index_1.WeatherLocationData(location, rainfallData, temperatureData);
                weatherLocationDataList.push(weatherData);
            });
            weatherPromises.push(rainfallRequestPromise);
            weatherPromises.push(temperatureRequestPromise);
        });
        Promise.all(weatherPromises).then(function (responses) {
            _this.onWeatherPollCompleteListeners.forEach(function (onWeatherPollCompleteListener) {
                onWeatherPollCompleteListener.onWeatherRetrieved(weatherLocationDataList);
            });
        });
    };
    return MelbourneWeatherClient;
}());
exports.MelbourneWeatherClient = MelbourneWeatherClient;
// TODO: There are a lot of optional settings we can set in this builder
var Builder = (function () {
    function Builder() {
    }
    Builder.prototype.build = function () {
        return new Promise(function (resolve, reject) {
            Soap.createClient('http://viper.infotech.monash.edu.au:8180/axis2/services/MelbourneWeather2?wsdl')
                .then(function (weatherService) {
                var melbourneWeatherClient = new MelbourneWeatherClient(weatherService);
                resolve(melbourneWeatherClient);
            })
                .catch(function (error) {
                reject(error);
            });
        });
    };
    return Builder;
}());
exports.Builder = Builder;
exports.default = MelbourneWeatherClient;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var MelbourneWeatherClient_1 = __webpack_require__(0);
new MelbourneWeatherClient_1.Builder()
    .build()
    .then(function (melbourneWeatherClient) {
    melbourneWeatherClient.addOnWeatherRetrievedListener(new (function () {
        function class_1() {
        }
        class_1.prototype.onWeatherRetrieved = function (weatherLocationDataList) {
            console.log(weatherLocationDataList);
        };
        return class_1;
    }()));
    melbourneWeatherClient.addOnLocationsRetrievedListener(new (function () {
        function class_2() {
        }
        class_2.prototype.onLocationsRetrieved = function (locations) {
            console.log(locations);
            setInterval(function () { melbourneWeatherClient.retrieveWeatherData(locations); }, 5000);
        };
        return class_2;
    }()));
    melbourneWeatherClient.retrieveLocations();
});


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var RainfallData = (function () {
    function RainfallData(rainfall, timestamp) {
        this.rainfall = rainfall;
        this.timestamp = timestamp;
    }
    return RainfallData;
}());
exports.RainfallData = RainfallData;
exports.default = RainfallData;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var TemperatureData = (function () {
    function TemperatureData(temperature, timestamp) {
        this.temperature = temperature;
        this.timestamp = timestamp;
    }
    return TemperatureData;
}());
exports.TemperatureData = TemperatureData;
exports.default = TemperatureData;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var WeatherLocationData = (function () {
    function WeatherLocationData(location, rainfallData, temperatureData) {
        this.location = location;
        this.rainfallData = rainfallData;
        this.temperatureData = temperatureData;
    }
    return WeatherLocationData;
}());
exports.WeatherLocationData = WeatherLocationData;
exports.default = WeatherLocationData;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var TemperatureData_1 = __webpack_require__(3);
exports.TemperatureData = TemperatureData_1.TemperatureData;
var RainfallData_1 = __webpack_require__(2);
exports.RainfallData = RainfallData_1.RainfallData;
var WeatherLocationData_1 = __webpack_require__(4);
exports.WeatherLocationData = WeatherLocationData_1.WeatherLocationData;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("soap-as-promised");

/***/ })
/******/ ]);
//# sourceMappingURL=backend-compiled-debug.js.map