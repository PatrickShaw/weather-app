import * as Google from '@google/maps';
// This class and type script definitions adapted from 
// github user: lukas-zech-software
// https://gist.github.com/lukas-zech-software/a7e4a23a6833ec1abb1fc836138f7822

class GeoCodingServiceClient {

  private readonly geoCoder;

  public constructor() {
    this.geoCoder = Google.createClient({
      // Google Places API key.
      key: 'AIzaSyBZOpO8-lc7tx9GJRdrFMzH9kqF5d-Y1RQ',
    });

  }

  public geocodeAddress(addressToQuery: string): Promise<google.maps.GeocoderResult[]> {
    return new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      const request: google.maps.GeocoderRequest = {
        address: addressToQuery
      };
      this.geoCoder.geocode(request, (error, response) => {        
        if (error == null) {
          resolve(response.json.results);
        } else {
          reject(error);  
        }
      });
    });

  }
}

export default GeoCodingServiceClient;
export {GeoCodingServiceClient}; 
