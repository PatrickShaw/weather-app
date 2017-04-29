import './theme/full-lambda-theme.scss';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {Routes} from './routes/Routes';

// Render HTML page based on routes (only has index page).
ReactDOM.render(
  <Routes/>,
  document.getElementById('root') as HTMLElement
);
