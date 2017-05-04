import './theme/full-lambda-theme.scss';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { WeatherPageContainer } from './controller/WeatherPageContainer';

// Render HTML page based on routes (only has index page).
ReactDOM.render(
  <WeatherPageContainer/>,
  document.getElementById('root') as HTMLElement
);
