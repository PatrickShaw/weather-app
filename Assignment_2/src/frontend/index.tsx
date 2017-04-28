import  * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Redux from 'redux';
import {createStore} from 'redux';
import './index.css';
import {AppState} from './model/AppState';
import {AppReducer} from './reducers/AppReducer';
import {Routes} from './routes/Routes';
const store: Redux.Store<AppState | undefined> = createStore(AppReducer);
ReactDOM.render(
  <Routes store={store}/>,
  document.getElementById('root') as HTMLElement
);
