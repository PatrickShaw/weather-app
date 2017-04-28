import * as React from 'react';
import {LocationItem} from './LocationItem';
import {WeatherLocationData} from '../../model/index';
interface WeatherListProps {
    locations: string[];
}
class WeatherList extends React.Component<WeatherListProps, void> {
    constructor() {
        super();
    }

    render() {
        return (
            <section>
                {
                    this.props.locations.map((location, locationIndex) => {
                        return <LocationItem key={locationIndex} location={location}/>;
                    })
                }
            </section>
        );
    }
}
export {WeatherList};
export default WeatherList;
