import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Routes} from './routes/Routes';
import './theme/full-lambda-theme.scss';
ReactDOM.render(
  <Routes/>,
  document.getElementById('root') as HTMLElement
);
