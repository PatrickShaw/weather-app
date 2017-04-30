import { MonitorMetadata } from '../model/MonitorMetadata';

interface OnAddedMonitoredLocationObserver {
  onAddedMonitoredLocation(monitor: MonitorMetadata): void;
}

interface OnRemovedMonitoredLocationObserver {
  onRemovedMonitoredLocation(monitor: MonitorMetadata): void;
}

class MonitoringManager {
  private monitoredLocations: Map<string, MonitorMetadata>;
  private onAddedMonitoredLocationObservers: Set<OnAddedMonitoredLocationObserver>;
  private onRemovedMonitoredLocationObservers: Set<OnRemovedMonitoredLocationObserver>;

  constructor() {
    this.monitoredLocations = new Map<string, MonitorMetadata>();
    this.onAddedMonitoredLocationObservers = new Set<OnAddedMonitoredLocationObserver>();
    this.onRemovedMonitoredLocationObservers = new Set<OnRemovedMonitoredLocationObserver>();    
  }

  public getMonitoredLocations(): Set<string> {
    const locationsSet: Set<string> = new Set<string>();
    for (const monitoredLocation of this.monitoredLocations.keys()) {
      locationsSet.add(monitoredLocation);
    }
    return locationsSet;
  }

  public addMonitorLocation(monitor: MonitorMetadata): void {
    if (!this.monitoredLocations.has(monitor.location)) {
      this.monitoredLocations.set(monitor.location, monitor);
      for (const onAddedMonitoredLocationObserver of this.onAddedMonitoredLocationObservers) {
        onAddedMonitoredLocationObserver.onAddedMonitoredLocation(monitor);
      }
    }
  }

  public removeMonitoredLocation(monitor: MonitorMetadata): void {
    if (this.monitoredLocations.has(monitor.location)) {
      this.monitoredLocations.delete(monitor.location);
      for (const onRemovedMonitoredLocationObserver of this.onRemovedMonitoredLocationObservers) {
        onRemovedMonitoredLocationObserver.onRemovedMonitoredLocation(monitor);
      }
    }
  }

  public addOnAddedMonitoredLocationObserver(observer: OnAddedMonitoredLocationObserver): void {
    this.onAddedMonitoredLocationObservers.add(observer);
  }

  public removeOnAddedMonitoredLocationObserver(observer: OnAddedMonitoredLocationObserver): void {
    this.onAddedMonitoredLocationObservers.delete(observer);
  }

  public addOnRemovedMonitoredLocationObserver(observer: OnRemovedMonitoredLocationObserver): void {
    this.onRemovedMonitoredLocationObservers.add(observer);
  }

  public removeOnRemovedMonitoredLocationObserver(observer: OnRemovedMonitoredLocationObserver): void {
    this.onRemovedMonitoredLocationObservers.delete(observer);
  }
}
export {MonitoringManager, OnAddedMonitoredLocationObserver, OnRemovedMonitoredLocationObserver};
export default MonitoringManager;
