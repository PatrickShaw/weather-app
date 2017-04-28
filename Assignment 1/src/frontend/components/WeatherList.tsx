import * as React from 'react';
import {WeatherItem} from './WeatherItem';
import {WeatherLocationData} from '../../model/index';
interface WeatherListProps {
    weatherData: Array<WeatherLocationData>;
}
class WeatherList extends React.Component<WeatherListProps, void> {
    constructor() {
        super();
    }

    render() {
        return (
            <section>
                {
                    this.props.weatherData.map((weather, weatherIndex) => {
                        return <WeatherItem key={weatherIndex} weather={weather}/>;
                    })
                }
            </section>
        );
    }
}
export {WeatherList};
export default WeatherList;
