// I dont like this.

class LocationServicePrefixer {
  public static prefixLocation(servicePrefix: string, location: string): string {
    return `${servicePrefix}${location}`;
  }
}

export {LocationServicePrefixer};
export default LocationServicePrefixer;
