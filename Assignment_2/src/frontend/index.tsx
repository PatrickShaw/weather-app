import './theme/full-lambda-theme.scss';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { WeatherPageContainer } from './controller/WeatherPageContainer';

// Attach our React components to the 'root' id in the HTML page.
ReactDOM.render(
  <WeatherPageContainer/>,
  document.getElementById('root') as HTMLElement
);
