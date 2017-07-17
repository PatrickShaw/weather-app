import { MonitorMetadata } from '../model/MonitorMetadata';

/**
 * Represents an observer who's method is called when a monitored location is added to a location manager.
 */
type OnAddedMonitoredLocationObserver = (monitor: MonitorMetadata) => void;

/**
 * Represents an observer who's method is called when a monitored location is removed from a location manager.
 */
type OnRemovedMonitoredLocationObserver = (monitor: MonitorMetadata) => void;

/**
 * Controller class to monitor which locations are required to display data for, one instance for each frontend session.
 */
class LocationMonitoringManager {
  // The locations that this manager is currently keeping a track of.
  // Note that MonitorMetadata currently just has a location. However, in the future, we may add more data to
  // the monitorm metadata.
  private monitoredLocations: Map<string, MonitorMetadata>;  
  // Observer list for when a monitor is added to the manager
  private onAddedMonitoredLocationObservers: Set<OnAddedMonitoredLocationObserver>;
  // Observer list for when a monitor is removed from the manager
  private onRemovedMonitoredLocationObservers: Set<OnRemovedMonitoredLocationObserver>;

  constructor() {
    this.monitoredLocations = new Map<string, MonitorMetadata>();
    // We're just going to assume that no one wants to add an observer twice, performance is more important so 
    // we're going to use a Set.
    this.onAddedMonitoredLocationObservers = new Set<OnAddedMonitoredLocationObserver>();
    this.onRemovedMonitoredLocationObservers = new Set<OnRemovedMonitoredLocationObserver>();    
  }

  /**
   * Gets all locations within the location monitoring manager as a set.
   */
  public getMonitoredLocations(): Set<string> {
    const locationsSet: Set<string> = new Set<string>();
    // monitoredLocations.keys() effectively returns the equivelant of Iterator<String> in Java
    // Consequently we need to add it to a new set so we can use the locations more than once.
    // That said, alternatively we could return the iterator and let the caller of the method put the 
    // locations into whatever data structure they like. That's out of scope for this assignment
    for (const monitoredLocation of this.monitoredLocations.keys()) {
      locationsSet.add(monitoredLocation);
    }
    return locationsSet;
  }

  /**
   * Adds a monitored location from the manager
   */
  public addMonitorLocation(monitor: MonitorMetadata): void {
    if (!this.monitoredLocations.has(monitor.location)) {
      this.monitoredLocations.set(monitor.location, monitor);
      for (const onAddedMonitoredLocationObserver of this.onAddedMonitoredLocationObservers) {
        onAddedMonitoredLocationObserver(monitor);
      }
    }
  }

  /**
   * Removes a monitored location from the manager
   */
  public removeMonitoredLocation(monitor: MonitorMetadata): void {
    if (this.monitoredLocations.has(monitor.location)) {
      this.monitoredLocations.delete(monitor.location);
      for (const onRemovedMonitoredLocationObserver of this.onRemovedMonitoredLocationObservers) {
        onRemovedMonitoredLocationObserver(monitor);
      }
    }
  }

  /**
   * Adds an on add monitored location observer to the manager.
   */
  public addOnAddedMonitoredLocationObserver(observer: OnAddedMonitoredLocationObserver): void {
    this.onAddedMonitoredLocationObservers.add(observer);
  }

  /**
   * Removes an on add monitored location observer from the manager.
   */
  public removeOnAddedMonitoredLocationObserver(observer: OnAddedMonitoredLocationObserver): void {
    this.onAddedMonitoredLocationObservers.delete(observer);
  }

  /**
   * Adds an on remove monitored location observer from the manager.
   */
  public addOnRemovedMonitoredLocationObserver(observer: OnRemovedMonitoredLocationObserver): void {
    this.onRemovedMonitoredLocationObservers.add(observer);
  }

  /**
   * Removes an on remove monitored location observer from the manager.
   */
  public removeOnRemovedMonitoredLocationObserver(observer: OnRemovedMonitoredLocationObserver): void {
    this.onRemovedMonitoredLocationObservers.delete(observer);
  }
}
export {LocationMonitoringManager, OnAddedMonitoredLocationObserver, OnRemovedMonitoredLocationObserver};
export default LocationMonitoringManager;
