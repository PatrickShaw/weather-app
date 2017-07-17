import {
  LocationMonitoringManager,
  OnAddedMonitoredLocationObserver,
  OnRemovedMonitoredLocationObserver,
} from './LocationMonitoringManager';

import { MonitorMetadata } from '../model/MonitorMetadata';

/**
 * Controller class to monitor all sessions, keeps track of LocationMonitorManager based on session ids.
 * Keeps track of some collective statistics of the locations being monitored like the number of sessions 
 * that are tracking the location.
 */
class SessionMonitoringManager {
  // The map from the session id to the location manager.
  private readonly monitoringSessions: Map<string, LocationMonitoringManager>;
  // The map of locations to the number of sessions that are monitoring a given location.
  private readonly sessionMonitoringLocationCounts: Map<string, number>;
  // The observer that we'll be adding to each manager so we can keep count of the number of people monitoring 
  // a given location. Increments the count on each add.
  private readonly onAddedMonitoredLocationObserver: OnAddedMonitoredLocationObserver;
  // Also used to keep count of the number of people monitoring a given location.
  // Decrements the count on each removal.
  private readonly onRemovedMonitoredLocationObserver: OnRemovedMonitoredLocationObserver;

  constructor() {
    this.monitoringSessions = new Map<string, LocationMonitoringManager>();
    this.sessionMonitoringLocationCounts = new Map<string, number>();
    this.onAddedMonitoredLocationObserver =
      (monitor: MonitorMetadata) => {
        if (!(monitor.location in this.sessionMonitoringLocationCounts)) {
          this.sessionMonitoringLocationCounts.set(monitor.location, 1);
        } else {
          this.incrementLocationCountFromMonitor(monitor, 1);
        }
    };

    this.onRemovedMonitoredLocationObserver = (monitor: MonitorMetadata) => {
      this.incrementLocationCountFromMonitor(monitor, -1);
    };
  }

  /**
   * Essentially an overloader method for MonitorMetadata. Unfortunately Typescript has trouble with 
   * overloading methods.
   */
  public incrementLocationCountFromMonitor(monitor: MonitorMetadata, amountIncremented: number): void {
    this.incrementLocationCount(monitor.location, amountIncremented);
  }

  /**
   * Increments the location count of a given location.
   */
  public incrementLocationCount(monitoredLocation: string, amountIncremented: number): void {
    // Get the count associated with thep provided location.
    const retrievedMonitoringCount: number | undefined = 
      this.sessionMonitoringLocationCounts.get(monitoredLocation);
    // If the number was undefined then replace the value with 0.
    // Unfortunately there's no default dictionary in ECMAScript 2015 so we have to mimic the functionaltiy
    // manually.
    const sessionMonitoringLocationCount: number 
      = retrievedMonitoringCount !== undefined ? retrievedMonitoringCount : 0;
      // Now set the value but with the incremented amount added in.
    this.sessionMonitoringLocationCounts.set(monitoredLocation, sessionMonitoringLocationCount + amountIncremented);
  }
  
  /**
   * Gets the location manager for a given session id.
   */
  public getLocationMonitorManagerForSession(sessionId: string): LocationMonitoringManager | undefined {
    return this.monitoringSessions.get(sessionId);
  }

  /**
   * Adds a location manager, given a session id, into the session manager.
   */
  public addMonitoringSession(sessionId: string, monitoringSession: LocationMonitoringManager): void {
    // Make sure that a location manager doesn't already exist.
    if (!(sessionId in this.monitoringSessions)) {
      // Good there's no location manager, let's set it to the one that we've been provided.
      this.monitoringSessions.set(sessionId, monitoringSession);
      // Now increment each count that the location manager has by 1.
      for (const monitoredLocation of monitoringSession.getMonitoredLocations().keys()) {
        this.incrementLocationCount(monitoredLocation, 1);
      }
      // Also add listeners to the location manager so we can keep track of the monitored locations count.
      monitoringSession.addOnAddedMonitoredLocationObserver(this.onAddedMonitoredLocationObserver);
      monitoringSession.addOnRemovedMonitoredLocationObserver(this.onRemovedMonitoredLocationObserver);
    } else {
      // The location manager already exists. Throw an error because this probably shouldn't happen.
      throw new Error(`Monitoring session with session ID ${sessionId} already exists within the session manager`);
    }
  }
  public removeMonitoringSession(sessionId: string): void {
    // Get the existing location manager.
    const monitoringSession: LocationMonitoringManager | undefined = this.monitoringSessions.get(sessionId);
    // Check if an actual location manager actually exists.
    if (monitoringSession !== undefined) {
      // Remove the observers that we added previously.
      monitoringSession.removeOnAddedMonitoredLocationObserver(this.onAddedMonitoredLocationObserver);
      monitoringSession.removeOnRemovedMonitoredLocationObserver(this.onRemovedMonitoredLocationObserver);
      this.monitoringSessions.delete(sessionId);
      // Decrement by 1 for each location that the location manager was monitoring
      for (const monitoredLocation of monitoringSession.getMonitoredLocations().keys()) {
        this.incrementLocationCount(monitoredLocation, -1);
      }
    } else {
      // The location manager doesn't exist with the session manager. Throw an error.
      throw new Error(`No monitoring session with session id ${sessionId}`);
    }
  }

  /**
   * Gets the set of all locations that are actually being monitored by a location manager within the session manager.
   */
  public getAllMonitoredLocations(): Set<string> {
    // This is the set that we're going to add the locations to.
    const monitoredLocations: Set<string> = new Set<string>();
    // Go through each key in the location count.
    for (const location of this.sessionMonitoringLocationCounts.keys()) {
      const monitoringCount: number | undefined = this.sessionMonitoringLocationCounts.get(location);
      if (monitoringCount !== undefined) {
        if (monitoringCount > 0) {
          monitoredLocations.add(location);
        }
      } else {
        // This shouldn't ever be called but if does. Throw an error.
        // A value shouldn't be undefined if there's a key that exists for the value.
        throw new Error(`Has key ${location} but count is ${monitoringCount}`);
      }
    }
    return monitoredLocations;
  }
}

export {SessionMonitoringManager};
export default SessionMonitoringManager;
