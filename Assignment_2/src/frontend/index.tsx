/// <reference path="../../node_modules/@types/googlemaps/index.d.ts" />
import './theme/full-lambda-theme.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { WeatherPage } from './view/WeatherPage';
import {appState} from './state'  ;
// Attach our React components to the 'root' id in the HTML page.
ReactDOM.render(
  <WeatherPage appCurrentState={appState}/>,  
  document.getElementById('root')
);
