import * as React from 'react';

import GoogleMap from 'google-map-react';

interface GoogleWeatherMapProps {
  something: string;

}

class GoogleWeatherMap extends React.Component<GoogleWeatherMapProps, void> {

  public render(): JSX.Element {
    return (
      <GoogleMap
        zoom={9}
        center={{lat: -37.81950134905335, lng: 144.98429111204815}}
        
      >
      </GoogleMap>
    );
  }
  
}

export default GoogleWeatherMap;
export {GoogleWeatherMap};
