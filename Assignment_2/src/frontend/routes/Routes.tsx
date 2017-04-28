import * as React from 'react';
import {BrowserRouter, Route} from 'react-router-dom';
import {WeatherPage} from '../pages/WeatherPage';
class Routes extends React.Component<{}, void> {
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
