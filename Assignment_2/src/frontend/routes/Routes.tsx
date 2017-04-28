import * as React from 'react';
import {BrowserRouter, Route} from 'react-router-dom';
import {Provider} from 'react-redux';
import {HomePage} from '../pages/HomePage';
import {WeatherPage} from '../pages/WeatherPage';
import {AppState} from '../model/AppState';
import * as SocketIo from 'socket.io-client';
import { WeatherLocationData } from '../../model/WeatherLocationData';
interface RoutesProps {
    store: Redux.Store<AppState | undefined>;
}
class Routes extends React.Component<RoutesProps, void> {
    render() {
        return (
            <BrowserRouter>
                <div>
                    <Route exact={true} path="/" component={WeatherPage}/>
                </div>
            </BrowserRouter>
        );
    }
}
export {Routes};
export default Routes;
