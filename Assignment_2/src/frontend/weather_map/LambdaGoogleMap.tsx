import * as React from 'react';

/* tslint:disable */

class Map extends React.Component<any, any> {
  private map;

  public componentDidMount() {
    // Component already rendered, have access to the DOM.
    
    // new google.maps.Map(this.refs.map, 
    // )
    // "https://maps.googleapis.com/maps/api/js?key=AIzaSyAxhlLHBbuas8eMitNV0agVB-OHTWACS8A&callback=initMap"
    console.log('Mounting');
    const map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 8
    });
    console.log(map);
    this.map = map;
    this.setState({});
    console.log('Mounted');
    /*//
    <script>
      var map;
      function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: -34.397, lng: 150.644},
          zoom: 8
        });
      }
    </script>*/
    //

    // console.log('Mounted');
    // console.log(map);
  }

  public render() {
    return (
    <div id="map">
    </div>


    );
  }


}

export default Map;
export { Map };


// class MonitoringItem extends React.Component<MonitoringItemProps, void> {
