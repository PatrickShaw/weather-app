import { GoogleMapsClient, createClient } from '@google/maps';

// This class and type script definitions adapted from 
// github user: lukas-zech-software
// https://gist.github.com/lukas-zech-software/a7e4a23a6833ec1abb1fc836138f7822

class GeoCodingService {

  private geoCoder: GoogleMapsClient;

  public constructor() {
    this.geoCoder = createClient({
      // Google Places API key for forkme-mock account.
      key: 'AIzaSyBZOpO8-lc7tx9GJRdrFMzH9kqF5d-Y1RQ',
    });

  }

  public geocodeAddress(addressToQuery: string): Promise<google.maps.GeocoderResult[]> {
    // console.log('Geocoder querying for: ' + addressToQuery);
    const request: google.maps.GeocoderRequest = {
      address: addressToQuery
    };

    return new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      this.geoCoder.geocode(request, (error, response) => {
        // console.log('Request');
        // console.log(request);
        // console.log('GeoCoder Response');
        // console.log(response);
        
        if (error) {
          reject(error);
        }
        resolve(response.json.results);

      });
    });

  }
}

// Notes on parsing response:
// A bit weird because of () => number, typescript definitions might be wrong.
// const testLatitude: number = jsonResult['geometry']['location'].lat;
// // TypeError: jsonResult.geometry.location.lat is not a function
// // at GoogleWeatherMap.tsx:31
// // at <anonymous>
// console.log('test: ' + testLatitude);
// const test: google.maps.GeocoderGeometry = jsonResult['geometry'];
// const x: () => number = test2['lat'];  
// LatLng().lat() is a thing but can't access the fn lat(), 

export default GeoCodingService;
export {GeoCodingService}; 
