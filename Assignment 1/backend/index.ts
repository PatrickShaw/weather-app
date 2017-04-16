const SocketIo = require('socket.io');
const Soap = require('soap-as-promised');
const url = 'http://viper.infotech.monash.edu.au:8180/axis2/services/MelbourneWeather2?wsdl';
const ioServer = SocketIo.listen(1337);
Soap.createClient(url)
.then(function(weatherService) {
    setInterval(() => pollWeatherData(weatherService), 5000);
});
function pollWeatherData(weatherService) {
  weatherService.getLocations(null)
    .then(function (locationsResponse) {
      let locations: Array<string> = locationsResponse.return;
      console.log(locations);
      let locationWeatherPromises: Array<Promise<Array<string>>> = [];
      locations.forEach(function (location: string) {
        locationWeatherPromises.push(
          weatherService.getRainfall({parameters: location})
            .then(function (rainfallResponse) {
              var rainfall = rainfallResponse.return;
              console.log(`${location}'s rainfall: ${rainfall}`);
            })
            .catch(function(error) {
              console.log(`Failed to get rainfall for ${location}`);
            })
        );
        locationWeatherPromises.push(
          weatherService.getTemperature({parameters: location})
            .then(function(temperatureResponse) {
              var temparature = temperatureResponse.return;
              console.log(`${location}'s temperature: ${temparature}`);
            })
            .catch(function(error) {
              console.log(`Failed to get temperature for ${location}`);
            })
        );
      });
      Promise.all(locationWeatherPromises)
        .then(function(test) {
          console.log("Yay!");
        });
    });
}