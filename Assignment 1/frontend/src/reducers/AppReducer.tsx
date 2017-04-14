import {Action} from 'redux';
import {WeatherDataItem} from '../model/WeatherDataItem';
import {AppState} from '../model/AppState';
const initialState: AppState = new AppState([
    new WeatherDataItem('Frankston', '10', '10'),
    new WeatherDataItem('Clayton', '11', '11')
]);
function AppReducer(state: AppState = initialState, action: Action): AppState {
  return state;
}
export {AppReducer};
export default AppReducer;