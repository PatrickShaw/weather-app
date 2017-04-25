import {Action} from 'redux';
import {WeatherLocationData, RainfallData, TemperatureData} from '../../model/index';
import {AppState} from '../model/AppState';
const initialState: AppState = new AppState([
    new WeatherLocationData(
       'Frankston',
       new RainfallData('10', '10/06/2016'), 
       new TemperatureData('11', '10/06/2017')),

    new WeatherLocationData(
      'Clayton', 
      new RainfallData('12', '10/06/2016'), 
      new TemperatureData('13', '10/06/2017'))
]); 
function AppReducer(state: AppState = initialState, action: Action): AppState {
  return state;
}
export {AppReducer};
export default AppReducer;
