import * as React from 'react';

import { GeoCodingService } from '../utils/GeoCodingService';
import GoogleMap from 'google-map-react';

interface GoogleWeatherMapProps {
  something: string;


}

class GoogleWeatherMap extends React.Component<GoogleWeatherMapProps, void> {
  public render(): JSX.Element {
    console.log('GEO CODER BELOW');
    const g = new GeoCodingService();
    g.geocodeAddress().then((results) => {
      console.log('results -- under --', results);
      console.log(results);
      // const result = response.json.results[0];
      // const location = results.geometry.location;

        // @types/googlemaps describe the Javascript API not the JSON object on the response
        // there a sublte difference like lat/lng beeing number not functions, making this `<any>` cast necessary
      
    });

    return (
      <div className="map">
        <GoogleMap
          zoom={9}
          center={{lat: -37.81950134905335, lng: 144.98429111204815}}
        >
        </GoogleMap>
      </div>
    );
  }
  
}

export default GoogleWeatherMap;
export {GoogleWeatherMap};
