import * as React from 'react';
import * as Redux from 'redux';
import {BrowserRouter, Route} from 'react-router-dom';
import {Provider} from 'react-redux';
import {HomePage} from '../pages/HomePage';
import {WeatherPage} from '../pages/WeatherPage';
import {AppState} from '../model/AppState';
import * as SocketIo from 'socket.io-client';
import {WeatherLocationData} from '../../model/WeatherLocationData';
interface RoutesProps {
    store: Redux.Store<AppState | undefined>;
}
class Routes extends React.Component<RoutesProps, void> {
    constructor() {
        super();
        // Trigger io.sockets.on('connection')
        var io: SocketIOClient.Socket = SocketIo.connect('http://127.0.0.1:8080');
        io.emit('msg_from_front_end', 'Hello from the other side');
        io.on('update_weather_location_data', function(weatherLocationDataList: Array<WeatherLocationData>) {
            console.log('Recieved weather location data');
            console.log(weatherLocationDataList);
        });
    }
    render() {
        return (
            <Provider store={this.props.store}>
                <BrowserRouter>
                    <div>
                        <Route path="/home" component={HomePage}/>
                        <Route exact={true} path="/" component={WeatherPage}/>
                    </div>
                </BrowserRouter>
            </Provider>
        );
    }
}
export {Routes};
export default Routes;
