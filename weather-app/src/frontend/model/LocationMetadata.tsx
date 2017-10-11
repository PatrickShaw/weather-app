import {observable, action} from 'mobx';
class LocationMetadata {
  public readonly location: string;
  // The service prefixes that are associated with this location.
  // i.e. A list of which services actually have this location.
  @observable public readonly prefixedLocations: Set<string>;
  constructor(location: string, servicePrefixes: Set<string>) {
    this.location = location;
    this.prefixedLocations = servicePrefixes;
  }
  @action
  public addServicePrefix(prefix: string): void {
    this.prefixedLocations.add(prefix);
  }
  @action
  public deleteServicePrefix(prefix: string): void {
    this.prefixedLocations.delete(prefix);
  }
  @action
  public clearServicePrefixes(): void {
    this.prefixedLocations.clear();
  }
}
export {LocationMetadata};
export default LocationMetadata;
