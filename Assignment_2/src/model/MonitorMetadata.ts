/**
 * Metadata for a LocationMotoringManager.
 */
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
