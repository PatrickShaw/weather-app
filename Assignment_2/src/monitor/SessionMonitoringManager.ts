import {
  LocationMonitoringManager,
  OnAddedMonitoredLocationObserver,
  OnRemovedMonitoredLocationObserver,
} from './LocationMonitoringManager';

import { MonitorMetadata } from '../model/MonitorMetadata';

/**
 * Controller class to monitor all sessions, keeps track of LocationMonitorManager based on session ids.
 */
class SessionMonitoringManager {
  private readonly monitoringSessions: Map<string, LocationMonitoringManager>;
  private readonly sessionMonitoringLocationCounts: Map<string, number>;
  private readonly onAddedMonitoredLocationObserver: OnAddedMonitoredLocationObserver;
  private readonly onRemovedMonitoredLocationObserver: OnRemovedMonitoredLocationObserver;

  constructor() {
    this.monitoringSessions = new Map<string, LocationMonitoringManager>();
    this.sessionMonitoringLocationCounts = new Map<string, number>();
    const that: SessionMonitoringManager = this;
    this.onAddedMonitoredLocationObserver = new class implements OnAddedMonitoredLocationObserver {
      public onAddedMonitoredLocation(monitor: MonitorMetadata): void {
        that.addMonitoredLocation(monitor);
      }
    }();

    this.onRemovedMonitoredLocationObserver = new class implements OnRemovedMonitoredLocationObserver {
      public onRemovedMonitoredLocation(monitor: MonitorMetadata): void {
        that.removeMonitoredLocation(monitor);
      }
    }();
  }

  public incrementLocationCountFromMonitor(monitor: MonitorMetadata, amountIncremented: number): void {
    this.incrementLocationCount(monitor.location, amountIncremented);
  }

  public incrementLocationCount(monitoredLocation: string, amountIncremented: number): void {
    const retrievedMonitoringCount: number | undefined = 
      this.sessionMonitoringLocationCounts.get(monitoredLocation);
    const sessionMonitoringLocationCount: number 
      = retrievedMonitoringCount !== undefined ? retrievedMonitoringCount : 0;
    this.sessionMonitoringLocationCounts.set(monitoredLocation, sessionMonitoringLocationCount + amountIncremented);
  }
  
  public getLocationMonitorManagerForSession(sessionId: string): LocationMonitoringManager | undefined {
    return this.monitoringSessions.get(sessionId);
  }

  public addMonitoringSession(sessionId: string, monitoringSession: LocationMonitoringManager): void {
    if (!(sessionId in this.monitoringSessions)) {
      this.monitoringSessions.set(sessionId, monitoringSession);
      for (const monitoredLocation of monitoringSession.getMonitoredLocations().keys()) {
        this.incrementLocationCount(monitoredLocation, 1);
      }
      monitoringSession.addOnAddedMonitoredLocationObserver(this.onAddedMonitoredLocationObserver);
      monitoringSession.addOnRemovedMonitoredLocationObserver(this.onRemovedMonitoredLocationObserver);
    } else {
      throw new Error(`Monitoring session with session ID ${sessionId} already exists within the session manager`);
    }
  }
  public removeMonitoringSession(sessionId: string): void {
    const monitoringSession: LocationMonitoringManager | undefined = this.monitoringSessions.get(sessionId);
    if (monitoringSession) {
      monitoringSession.removeOnAddedMonitoredLocationObserver(this.onAddedMonitoredLocationObserver);
      monitoringSession.removeOnRemovedMonitoredLocationObserver(this.onRemovedMonitoredLocationObserver);
      this.monitoringSessions.delete(sessionId);
      for (const monitoredLocation of monitoringSession.getMonitoredLocations().keys()) {
        this.incrementLocationCount(monitoredLocation, -1);
      }
    } else {
      throw new Error(`No monitoring session with session id ${sessionId}`);
    }
  }

  public getMonitoredLocations(): Set<string> {
    const monitoredLocations: Set<string> = new Set<string>();
    for (const location of this.sessionMonitoringLocationCounts.keys()) {
      const monitoringCount: number | undefined = this.sessionMonitoringLocationCounts.get(location);
      console.log(`${location} has ${monitoringCount} sessions monitoring it.`);
      if (monitoringCount !== undefined) {
        if (monitoringCount > 0) {
          monitoredLocations.add(location);
        }
      } else {
        throw new Error(`Has key ${location} but count is ${monitoringCount}`);
      }
    }
    return monitoredLocations;
  }

  private removeMonitoredLocation(monitor: MonitorMetadata): void {
    this.incrementLocationCountFromMonitor(monitor, -1);
  }

  private addMonitoredLocation(monitor: MonitorMetadata): void {
    if (!(monitor.location in this.sessionMonitoringLocationCounts)) {
      this.sessionMonitoringLocationCounts.set(monitor.location, 1);
    } else {
      this.incrementLocationCountFromMonitor(monitor, 1);
    }
  }
}

export {SessionMonitoringManager};
export default SessionMonitoringManager;
