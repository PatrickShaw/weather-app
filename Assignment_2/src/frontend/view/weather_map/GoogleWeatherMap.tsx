import './GoogleWeatherMap.scss';

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
  private geocoder: GeoCodingService;
  private currentWeatherService: string = '';

  constructor(props: GoogleWeatherMapProps) {
    super(props);
    this.googleMap = null;
    this.state = new WeatherMapState(new Map<string, LocationMarkerInformation>());  
    this.geocoder = new GeoCodingService();
  }

  // Render button on google map.
  public toggleControl(toggleDiv: HTMLDivElement, map: google.maps.Map) {
    // Set CSS for the control border.
    const toggleUI = document.createElement('div');
    toggleUI.style.backgroundColor = '#fff';
    toggleUI.style.border = '2px solid #fff';
    toggleUI.style.borderRadius = '3px';
    toggleUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    toggleUI.style.cursor = 'pointer';
    toggleUI.style.marginBottom = '22px';
    toggleUI.style.textAlign = 'center';
    toggleUI.title = 'Click to recenter the map';
    toggleDiv.appendChild(toggleUI);

    // Set CSS for the control interior.
    const toggleText = document.createElement('div');
    toggleText.style.color = 'rgb(25,25,25)';
    toggleText.style.fontFamily = 'Roboto,Arial,sans-serif';
    toggleText.style.fontSize = '16px';
    toggleText.style.lineHeight = '38px';
    toggleText.style.paddingLeft = '5px';
    toggleText.style.paddingRight = '5px';
    toggleText.innerHTML = 'Toggle weather service';
    toggleUI.appendChild(toggleText);

    // Setup the click event listeners: simply set the map to Chicago.
    toggleUI.addEventListener('click', () => {
      this.currentWeatherService = this.currentWeatherService === '' ? 'hello.world' : '';
      console.log('current weather service: ' + this.currentWeatherService);
      this.toggle();
      this.setState({}); // Force re-render.
    });
  }

  public componentDidMount(): void {
    const googleMap = new google.maps.Map(document.getElementById('map'), {
      center: {lat: -37.81950134905335, lng: 144.98429111204815},
      zoom: 8
    });
    this.googleMap = googleMap;
    const toggleDiv: HTMLDivElement = document.createElement('div');
    this.toggleControl(toggleDiv, this.googleMap);
    this.googleMap.controls[google.maps.ControlPosition.TOP_CENTER].push(toggleDiv);
  }

  // Toggles markers and circles so only those for current weather service shown.
  public toggle() {
    // Process only weather data objects we are monitoring (the rest shouldn't be shown anyways).
    for (const [locationKey, monitorData] of this.props.weatherDataMap.entries()) {
      if (monitorData.monitorRainfall || monitorData.monitorTemperature) {
        const locationMarkerInformation: LocationMarkerInformation | undefined | null = 
          this.state.locationInfoMap.get(locationKey);
        if (locationMarkerInformation == null) {
          continue;
        }
        if (locationKey.includes(this.currentWeatherService)) {
          locationMarkerInformation.marker.setVisible(true);
          locationMarkerInformation.circle.setVisible(true);
        } else {
          locationMarkerInformation.marker.setVisible(false);
          locationMarkerInformation.circle.setVisible(false);
        }
      }
    }
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
           
              pin.setMap(this.googleMap);

              if (locationKey.includes(this.currentWeatherService)) {
                pin.setVisible(true);
                circle.setVisible(true);
              } else {
                pin.setVisible(false);
                circle.setVisible(false);
              }
            
              const infoWindow = new google.maps.InfoWindow({
                content: '',
                maxWidth: 400
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
            const baseGreyTone = 220;
            const greyRange = 210;
            const blueOffset = 35;
            const blue = Math.round(baseGreyTone + blueOffset);
            const red = Math.round(baseGreyTone - greyRange * blueness);
            const green = Math.round((baseGreyTone + blueOffset * 0.25) - greyRange * blueness);
            const blueHex = blue.toString(16);
            const redHex = red.toString(16);
            const greenHex = green.toString(16);
            rainfallColorHex = `${redHex}${greenHex}${blueHex}`;
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

          if (locationKey.includes(this.currentWeatherService)) {
            pin.setVisible(true);
            circle.setVisible(true);
          } else {
            pin.setVisible(false);
            circle.setVisible(false);
          }

          let infoWindowContent: string = `<span class="txt-body-2">${formattedAddress}</span>`;
          if (temperature != null) {
            infoWindowContent 
              = `${infoWindowContent}<br/><strong>Temperature:</strong> ${Math.round(temperature  * 100 ) / 100} ℃`;
          }
          if (rainfall != null) {
            infoWindowContent 
              = `${infoWindowContent}<br/><strong>Rainfall:</strong> ${Math.round(rainfall * 100 ) / 100} mm`;
          }
          infoWindow.setContent(
            `<span class="txt-body-1">${infoWindowContent}</span>`
            );
          
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
            locationInfo.marker.setVisible(false);
            locationInfo.circle.setVisible(false);
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
