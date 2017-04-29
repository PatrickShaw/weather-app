class MonitoringManager {
  private monitoredLocations: Set<string>;
  private onMonitoredLocationAddedObservers: Set<(location: string) => void>;
  private onMonitoredLocationRemovedObservers: Set<(location: string) => void>;
  constructor() {
    this.monitoredLocations = new Set<string>();
    this.onMonitoredLocationAddedObservers = new Set<(location: string) => void>();    
  }
  public getMonitoredLocations(): Set<string> {
    return this.monitoredLocations;
  }
  public addMonitoredLocation(location: string) {
    this.monitoredLocations.add(location);
    for (const onAddedMonitoredLocationObserver of this.onMonitoredLocationAddedObservers) {
      onAddedMonitoredLocationObserver(location);
    }
  }
  public removeMonitoredLocation(location: string) {
    this.monitoredLocations.delete(location);
    for (const onMonitoredLocationRemovedObserver of this.onMonitoredLocationRemovedObservers) {
      onMonitoredLocationRemovedObserver(location);
    }
  }
  public addOnMonitoredLocationObserver(observer: (location: string) => void): void {
    this.onMonitoredLocationAddedObservers.add(observer);
  }
  public removeOnMonitoredLocationObserver(observer: (location: string) => void): void {
    this.onMonitoredLocationAddedObservers.delete(observer);
  }
}
export {MonitoringManager};
export default MonitoringManager;
