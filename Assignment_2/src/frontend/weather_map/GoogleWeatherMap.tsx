import * as React from 'react';

import { GeoCodingService } from './utils/GeoCodingService';
import GoogleMap from 'google-map-react';
import { MonitoredLocationInformation } from '../model/MonitoredLocationInformation';
import { WeatherMapState } from './WeatherMapState';

interface GoogleWeatherMapProps {
  something: string;
  readonly weatherDataMap: Map<string, MonitoredLocationInformation>;
}

interface LocationMarkerInformation {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

class GoogleWeatherMap extends React.Component<GoogleWeatherMapProps, WeatherMapState> {

  constructor(props: GoogleWeatherMapProps) {
    super(props);
   
    this.state = new WeatherMapState([]);
    
  }

  public getLocationInfo() {
    // Set up markers on google map.
    const geocoder: GeoCodingService = new GeoCodingService();
    // const locationsToProcess: LocationMarkerInformation[] = [];
    // this.state.locationInfo = [];
    // Reset location info.
    this.state.setLocationInfo([]);
    const geocodePromises: Array<Promise<any>> = [];
    for (const location of this.props.weatherDataMap.keys()) {    
      // A promise is returned by geocodeAddress().
      const geocodePromise: Promise<void> = geocoder.geocodeAddress(location + ', Melbourne, Australia')
        .then((results: google.maps.GeocoderResult[]) => {
          const jsonResult: google.maps.GeocoderResult = results[0];
          // Parse out info we need.
          const formattedAddress: string = jsonResult.formatted_address;
          const latLongString: string = JSON.stringify(jsonResult['geometry']['location']);
          const latLongJson: JSON = JSON.parse(latLongString);
          const latitude: number = latLongJson['lat'];
          const longitude: number = latLongJson['lng'];
                    
          // Make new object of type LocationMarkerInfo.
          const locationInfo: LocationMarkerInformation = {
            latitude,
            longitude,
            formattedAddress
          };         
          this.state.locationInfo.push(locationInfo);
          // locationsToProcess.push(locationInfo);
        })
        .catch((error) => {
          console.log(error);
        });
      // Collect promises.
      geocodePromises.push(geocodePromise);
    }
    // Wait for all geocode promises to finish.
    Promise.all(geocodePromises)
      .then((response) => {
        // Note: google map typings in node_modles/@types/googlemaps. Not sure why vs code red underlines
        // google sometimes but Marker is still resolved.
        const locationPins: google.maps.Marker[] = [];
        // // Place markers for all locations.
        
        for (const locInfo of this.state.locationInfo) {
          // TODO: This is buggy, need to place Map instance in map.
          const latlang = new google.maps.LatLng(locInfo.latitude, locInfo.longitude);
          const pin = new google.maps.Marker({
            position: latlang,
            map: GoogleMap,
            title: locInfo.formattedAddress
          });
          locationPins.push(pin);
        }
        console.log('Markers PLaced');
      })  
      .catch((error) => {
        console.log(error);
      });
  }
  public componentDidMount() {
    console.log('CompontentDidMount');
  }
  public render(): JSX.Element {   
    console.log('Render');
    console.log(this.state.locationInfo);
    this.getLocationInfo();
    
    return (
    <div className="map">
      <GoogleMap
        zoom={9}
        center={{lat: -37.81950134905335, lng: 144.98429111204815}}
      />      
    </div>
    );
  }
  
}

export default GoogleWeatherMap;
export {GoogleWeatherMap, LocationMarkerInformation};
