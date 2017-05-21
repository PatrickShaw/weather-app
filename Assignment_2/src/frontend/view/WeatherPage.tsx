import './WeatherPage.scss';

import * as React from 'react';

import {ActionBar} from './AppBar';
import {AppState} from '../model/AppState';
import { GoogleWeatherMap } from '../weather_map/GoogleWeatherMap';
import {LocationList} from './LocationList';
import {MonitoringList} from './MonitoringList';
import {OnLocationItemClickedObserver} from '../observers/OnLocationItemClickedObserver';
import {OnMonitoringItemClickedObserver} from '../observers/OnMonitoringItemClickedObserver';

interface WeatherPageProps {
  // Instance variable.
  readonly onLocationRainfallItemClickedObserver?: OnLocationItemClickedObserver;
  readonly onLocationTemperatureItemClickedObserver?: OnLocationItemClickedObserver;
  readonly onMonitoringListGraphItemClicked: OnMonitoringItemClickedObserver;
  readonly appCurrentState: AppState; 
}

/**
 * Specifies the markup for the actual weather page itself.
 * Takes in OnLocationItemClickedObservers from parent component.
 */
class WeatherPage extends React.Component<WeatherPageProps, void> {
  
  public render(): JSX.Element {
    return (

      <div className='weather-page'>
        <div className='page-heading'>
          <ActionBar title='Melbourne Weather' subtitle='Full Lambda'/>
        </div>
        <div className='main-content'>
          <aside className='sidebar'>
            <header>
              <h1 className='txt-subheading title-section'>Locations</h1>
            </header>
            <LocationList 
              locations={this.props.appCurrentState.locations} 
              weatherDataMap={this.props.appCurrentState.weatherDataMap}
              onRainfallItemClickedObserver={this.props.onLocationRainfallItemClickedObserver}
              onTemperatureItemClickedObserver={this.props.onLocationTemperatureItemClickedObserver}
            />
          </aside>

          <main className='monitoring-container'>
            <header>
              <h1 className='txt-subheading title-section'>
                Monitored location dashboard
              </h1>
            </header>
            <GoogleWeatherMap 
              weatherDataMap={this.props.appCurrentState.weatherDataMap}
              locationList={this.props.appCurrentState.locations}
            />
            <div className='monitoring-list-container'>
              <MonitoringList 
                locations={this.props.appCurrentState.locations} 
                weatherDataMap={this.props.appCurrentState.weatherDataMap}
                onGraphToggleClickedObserver={this.props.onMonitoringListGraphItemClicked}
              />
            </div>
          </main>
        </div>
        <footer className='page-footer'>
          <p className='copyright'>Melbourne Weather © 2017 David Lei and Patrick Shaw</p>
        </footer>
      </div>
    );
  }
}

// Note: Try Map id="map" later and return a div with id="map" in render, should work.
export {WeatherPage};
export default WeatherPage;
