class LocationMetadata {
  public readonly location: string;
  // The service prefixes that are associated with this location.
  // i.e. A list of which services actually have this location.
  public readonly prefixedLocations: Set<string>;
  constructor(location: string, servicePrefixes: Set<string>) {
    this.location = location;
    this.prefixedLocations = servicePrefixes;
  }
}
export {LocationMetadata};
export default LocationMetadata;
