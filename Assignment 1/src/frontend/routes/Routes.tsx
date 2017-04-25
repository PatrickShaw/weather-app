import * as React from 'react';
import * as Redux from 'redux';
import {BrowserRouter, Route} from 'react-router-dom';
import {Provider} from 'react-redux';
import {HomePage} from '../pages/HomePage';
import {WeatherPage} from '../pages/WeatherPage';
import {AppState} from '../model/AppState';
interface RoutesProps {
    store: Redux.Store<AppState | undefined>;
}
class Routes extends React.Component<RoutesProps, void> {
    render() {
        return (
            <Provider store={this.props.store}>
                <BrowserRouter>
                    <div>
                        <Route exact={true} path="/" component={HomePage}/>
                        <Route path="/weather" component={WeatherPage}/>
                    </div>
                </BrowserRouter>
            </Provider>
        );
    }
}
export {Routes};
export default Routes;