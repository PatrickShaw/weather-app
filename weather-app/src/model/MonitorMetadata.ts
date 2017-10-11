/**
 * Metadata for a LocationMotoringManager.
 * If changes to what determines a location i.e. logitude and latitue are added in
 * can use this class to hold that.
 */

// TODO: Rename, maybe call LocationMetadata if the graph rendering information is just stored in
// MonitoredLocationInformation?.
class MonitorMetadata {
  public readonly location;

  constructor(location: string) {
    this.location = location;
  }

  public toString(): string {
    return this.location;
  }
}
export {MonitorMetadata};
export default MonitorMetadata;
