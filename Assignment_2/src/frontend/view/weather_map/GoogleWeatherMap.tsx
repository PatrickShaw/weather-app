import * as React from 'react';

import { GeoCodingService } from './utils/GeoCodingService';
import { MonitoredLocationInformation } from '../../model/MonitoredLocationInformation';
import { WeatherLocationData } from '../../../model/WeatherLocationData';

interface GoogleWeatherMapProps {
  readonly weatherDataMap: Map<string, MonitoredLocationInformation>;
  // readonly locations: string[];
}

// Holds inofrmation for a location marker and it's circle.
class LocationMarkerInformation {
  public readonly latlng: google.maps.LatLng;
  public readonly formattedAddress: string;
  public readonly marker: google.maps.Marker;
  public readonly circle: google.maps.Circle;
  public readonly infoWindow: google.maps.InfoWindow;
  public readonly temperature?: number;
  public readonly rainfall?: number;
  constructor(
    latlng: google.maps.LatLng,
    formattedAddress: string,
    marker: google.maps.Marker,
    circle: google.maps.Circle,
    infoWindow: google.maps.InfoWindow,
    temperature?: number,
    rainfall?: number
  ) { 
    this.latlng = latlng;
    this.formattedAddress = formattedAddress;
    this.marker = marker;
    this.circle = circle;
    this.infoWindow = infoWindow;
    this.temperature = temperature;
    this.rainfall = rainfall;
  }
}

class WeatherMapState {
  public readonly locationInfoMap: Map<string, LocationMarkerInformation | null>;
  constructor(
    locationInfo: Map<string, LocationMarkerInformation | null>
  ) {
    this.locationInfoMap = locationInfo;
  }
}

class GoogleWeatherMap extends React.Component<GoogleWeatherMapProps, WeatherMapState> {
  private googleMap: google.maps.Map | null;
  private geocoder;

  constructor(props: GoogleWeatherMapProps) {
    super(props);
    this.googleMap = null;
    this.state = new WeatherMapState(new Map<string, LocationMarkerInformation>());  
    this.geocoder = new GeoCodingService();
  }

  public componentDidMount(): void {
    const googleMap = new google.maps.Map(document.getElementById('map'), {
      center: {lat: -37.81950134905335, lng: 144.98429111204815},
      zoom: 8
    });
    this.googleMap = googleMap;
  }

  public componentWillReceiveProps(nextProps: GoogleWeatherMapProps): void {
    if (this.googleMap == null) {
      this.googleMap = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -37.81950134905335, lng: 144.98429111204815},
        zoom: 8
    });
    }
    for (const [locationKey, monitorData] of nextProps.weatherDataMap.entries()) {
      // Check whether we're adding/updating or deleting a marker.
      if (monitorData.monitorRainfall || monitorData.monitorTemperature) {
        let newLocationInfoPromise: Promise<[
          string, google.maps.LatLng, google.maps.Marker, google.maps.Circle, google.maps.InfoWindow]>;
        // Location not in weathermap.
        if (!this.state.locationInfoMap.has(locationKey)) {
          // Using 'null' as a way of saying that something is going to populate this later. Hacky..
          this.state.locationInfoMap.set(locationKey, null);
          // We don't have location info for this location yet.
          // Go get the lat lng of the location.
          // Also add a new marker.
          newLocationInfoPromise = this.geocoder.geocodeAddress(locationKey + ', Melbourne, Australia')
            .then((results: google.maps.GeocoderResult[]) => {
              console.log(results);
              // Parse the info we need.
              const jsonResult: google.maps.GeocoderResult = results[0];
              const formattedAddress: string = jsonResult.formatted_address;
              const latLongString: string = JSON.stringify(jsonResult.geometry.location);
              const latLongJson: JSON = JSON.parse(latLongString);
              const latitude: number = latLongJson['lat'];
              const longitude: number = latLongJson['lng'];
              const latlng: google.maps.LatLng = new google.maps.LatLng(latitude, longitude);
              // Create a pin for the newly monitored location.
              const pin = new google.maps.Marker({
                position: latlng,
                title: formattedAddress
              });              
              // Not transparent until we calculate the correct colours and opacit later on.
              const circle = new google.maps.Circle({
                strokeOpacity: 0,
                fillOpacity: 0,
                center: latlng,
                radius: 10000
              });
              circle.setMap(this.googleMap);
              circle.setValues(true);
              pin.setMap(this.googleMap);
              pin.setVisible(true);

              const infoWindow = new google.maps.InfoWindow({
                content: 'a string here',
                maxWidth: 200
              });
              
              // Hacky but typescript requires this.
              const m: google.maps.Map | undefined = this.googleMap ? this.googleMap : undefined;

              pin.addListener('mouseover', () => {
                infoWindow.open(m, pin);
              });

              pin.addListener('mouseout', () => {
                infoWindow.close();
              });

              // return the parsed data for use.
              return [formattedAddress, latlng, pin, circle, infoWindow];
            })
            .catch((error) => {
              console.error(error);
            });
        } else {
          // Once again, null means something else is currently populating the entry.
          if (this.state.locationInfoMap.get(locationKey) === null) {
            continue;
          }
          // We already have the location information.
          // We just want the lat lng so resolve it.
          newLocationInfoPromise = 
            new Promise<[string, google.maps.LatLng, google.maps.Marker, google.maps.Circle, google.maps.InfoWindow]>
            ((resolve, reject) => {
              const locationInfo: LocationMarkerInformation | undefined | null 
                = this.state.locationInfoMap.get(locationKey);
              if (locationInfo != null) {
                resolve([locationInfo.formattedAddress, locationInfo.latlng, 
                  locationInfo.marker, locationInfo.circle, locationInfo.infoWindow]);
              } else {
                // TODO: This can technically happen via race conditions.
                reject('locationInfo was undefined');
              }
            });
        }
        newLocationInfoPromise.then(([formattedAddress, latlng, pin, circle, infoWindow]) => {
          pin.setVisible(true);
          
          // We have the data to build the marker information now.
          let rainfallString: string | null;
          let temperatureString: string | null;
          if (monitorData.weatherDataList.length > 0) {
            const recentWeatherData: WeatherLocationData = monitorData.weatherDataList[
              monitorData.weatherDataList.length - 1];
            rainfallString = recentWeatherData.rainfallData == null 
                ? null : recentWeatherData.rainfallData.rainfall;
            temperatureString = recentWeatherData.temperatureData == null 
                ? null : recentWeatherData.temperatureData.temperature;
          } else {
            rainfallString = null;
            temperatureString = null;
          }
          // Calculate the opacity of the circle according to how much rainfall there is.
          const rainfall: number | undefined 
            = rainfallString == null ? undefined : Number.parseFloat(rainfallString);
          const temperature: number | undefined 
            = temperatureString == null ? undefined : Number.parseFloat(temperatureString);
          let rainfallColorHex: string;
          if (rainfall != null) {
            // blueness varies from 0-100mm rainfall, any higher than 100 and the rainfall colour 
            // remains the same.
            const blueness = Math.max(0, Math.min(1, rainfall / 100));
            // 0-255, how white/black the grey tone will be.
            const greyTone = 120;
            const blue = Math.round(greyTone + blueness * 120);
            const blueHex = blue.toString(16);
            const greyHex = greyTone.toString(16);
            rainfallColorHex = `${greyHex}${greyHex}${blueHex}`;
          } else {
            rainfallColorHex = 'DD8888';
          }
          const pinIcon: google.maps.Icon = {
            url: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + rainfallColorHex
          };
          pin.setIcon(pinIcon);
          // Calculate the background color of the circle according to how hot it is.
          let heatColor: string;          
          if (temperature != null) {
            // redness will always be between 0 and 1.
            const redness = Math.max(0, Math.min(1, temperature / 42.0));
            heatColor = `rgb(220, ${Math.round(120 + (1 - redness) * 90)}, 120)`;
          } else {
            heatColor = '#888888';
          }
          // Now set the options of the circle.
          circle.setOptions({
            strokeColor: heatColor,
            strokeOpacity: 0.75,
            strokeWeight: 1,
            fillColor: heatColor,
            fillOpacity: 0.4,
          });
          circle.setVisible(true);
          let infoWindowContent: string = formattedAddress;
          if (temperature !== undefined) {
            infoWindowContent = `${infoWindowContent}<br/>Temperature: ${Math.round(temperature  * 100 ) / 100} ℃`;
          }
          if (rainfall !== undefined) {
            infoWindowContent = `${infoWindowContent}<br/>Rainfall: ${Math.round(rainfall * 100 ) / 100} mm`;

          }
          infoWindow.setContent(infoWindowContent);
          
          // Compile the data into a single object and set it to the info map.
          const locationInfo: LocationMarkerInformation = new LocationMarkerInformation(
            latlng, 
            formattedAddress, 
            pin, 
            circle,
            infoWindow,
            rainfall,
            temperature
          );
          // Update the map.
          this.state.locationInfoMap.set(locationKey, locationInfo);
        });
      } else {
        if (this.state.locationInfoMap.has(locationKey)) {
          // No longer monitoring this location so remove it from the map.
          const locationInfo: LocationMarkerInformation | undefined | null
            = this.state.locationInfoMap.get(locationKey);
          if (locationInfo != null) {
            // locationInfo.marker.setMap(null);
            locationInfo.marker.setVisible(false);
            locationInfo.circle.setVisible(false);
            // locationInfo.circle.setMap(null);
          }
        }
      }
    }
  }
  
  public render(): JSX.Element {       
    return (
      <div id='map'/>
    );
  }
  
}

export default GoogleWeatherMap;
export {GoogleWeatherMap, LocationMarkerInformation};
