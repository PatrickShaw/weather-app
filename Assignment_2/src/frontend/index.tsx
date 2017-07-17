/// <reference path="../../node_modules/@types/googlemaps/index.d.ts" />
import './theme/full-lambda-theme.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { WeatherPageContainer } from './controller/WeatherPageContainer';

// Attach our React components to the 'root' id in the HTML page.
ReactDOM.render(
  <WeatherPageContainer
    regularServicePrefix='regular_service_'
    regularServiceUrl='http://127.0.0.1:8081'
    timelapseServicePrefix='timelapse_service_'
    timelapseServiceUrl='http://127.0.0.1:8080'
  />,  
  document.getElementById('root')
);
