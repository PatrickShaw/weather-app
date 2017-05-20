import { GoogleMapsClient, createClient } from '@google/maps';

// This class and type script definitions adapted from 
// github user: lukas-zech-software
// https://gist.github.com/lukas-zech-software/a7e4a23a6833ec1abb1fc836138f7822

export class GeoCodingService {

  private geoCoder: GoogleMapsClient;

  public constructor() {
    this.geoCoder = createClient({
      key: 'AIzaSyBZOpO8-lc7tx9GJRdrFMzH9kqF5d-Y1RQ',
    });

  }

  public geocodeAddress(): Promise<google.maps.GeocoderResult[]> {
    const request: google.maps.GeocoderRequest = {
      address: '1600 Amphitheatre Parkway, Mountain View, CA'
    };

    return new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      this.geoCoder.geocode(request, (error, response) => {
        console.log('Request');
        console.log(request);
        console.log('Response');
        console.log(response);
        if (error) {
          reject(error);
        }

        resolve(response.json.results);

      });
    });

  }
}

