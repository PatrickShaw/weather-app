import * as React from 'react';
import {WeatherItem} from './WeatherItem';
import {WeatherDataItem} from '../model/WeatherDataItem';
interface WeatherListProps {
    weatherData: Array<WeatherDataItem>;
}
class WeatherList extends React.Component<WeatherListProps, void> {
    constructor() {
        super();
    }

    render() {
        return (
            <section>
                {
                    this.props.weatherData.map((weather) => {
                        return <WeatherItem weather={weather}/>;
                    })
                }
            </section>
        );
    }
}
export {WeatherList};
export default WeatherList;