import './WeatherPage.css';

import * as React from 'react';
import { ActionBar } from './AppBar';
import { AppState } from '../model/AppState';
import { GoogleWeatherMap } from './weather_map/GoogleWeatherMap';
import { LocationList } from './LocationList';
import { MonitoringList } from './MonitoringList';
  interface WeatherPageProps {
  readonly appCurrentState: AppState;
}
import {observer} from 'mobx-react';
/**
 * Specifies the markup for the actual weather page itself.
 * Takes in OnLocationItemClickedObservers from parent component.
 */
const WeatherPage: React.ClassicComponentClass<WeatherPageProps> = observer(({
  appCurrentState
}: WeatherPageProps) => (
  appCurrentState.getConnectedToServer() ?
  (
      <div className='weather-page'>
        <div className='page-app-bar'>
          <ActionBar title='Melbourne Weather' subtitle='Full Lambda'/>
        </div>
        <div className='main-content'>
          <aside className='sidebar'>
            <header className='title-section'>
              <h1 className='txt-headline'>Locations</h1>
            </header>
            <LocationList 
              locations={appCurrentState.sortedLocations}
              weatherDataMap={appCurrentState.weatherDataMap}
            />
          </aside>

          <main className='monitoring-container'>
            <header className='title-section'>
              <h1 className='txt-headline'>
                Monitored location dashboard
              </h1>
            </header>
            
            <div className='monitoring-list-container'>
            <section className='weather-map-container'>
              <GoogleWeatherMap
                weatherDataMap={appCurrentState.weatherDataMap}
              />
            </section>
            <div className='weather-card-container'>
              <MonitoringList 
                locations={appCurrentState.sortedLocations}
                weatherDataMap={appCurrentState.weatherDataMap}
              />
            </div>
          </div>
        </main>
      </div>
        <footer className='page-footer'>
          <p className='copyright'>Melbourne Weather © 2017 David Lei and Patrick Shaw</p>
        </footer>
      </div>
  ) : 
  (
    <h1 className='error'>
        WeatherMelbourne2 WSDL connection unsuccessful. 
        Make sure your device is connected to the internet and 
        http://viper.infotech.monash.edu.au:8180/axis2/services/MelbourneWeather2?wsdl is available.
    </h1>
  )
));

export {WeatherPage};
export default WeatherPage;
