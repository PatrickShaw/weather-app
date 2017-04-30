import './theme/full-lambda-theme.scss';
import 'reflect-metadata';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { WeatherPage } from './pages/WeatherPage';

// Render HTML page based on routes (only has index page).
ReactDOM.render(
  <WeatherPage/>,
  document.getElementById('root') as HTMLElement
);
