import {
  MonitoringManager,
  OnAddedMonitoredLocationObserver,
  OnRemovedMonitoredLocationObserver,
} from './MonitoringManager';

import { MonitorMetadata } from '../model/MonitorMetadata';

class MonitoringSessionManager {
  private readonly monitoringSessions: Map<string, MonitoringManager>;
  private readonly sessionMonitoringLocationCounts: Map<string, number>;
  private readonly onAddedMonitoredLocationObserver: OnAddedMonitoredLocationObserver;
  private readonly onRemovedMonitoredLocationObserver: OnRemovedMonitoredLocationObserver;
  constructor() {
    this.monitoringSessions = new Map<string, MonitoringManager>();
    this.sessionMonitoringLocationCounts = new Map<string, number>();
    const that: MonitoringSessionManager = this;
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
  
  public getMonitoringSession(sessionId: string): MonitoringManager | undefined {
    return this.monitoringSessions.get(sessionId);
  }

  public addMonitoringSession(sessionId: string, monitoringSession: MonitoringManager): void {
    console.assert(
      !(sessionId in this.monitoringSessions), 
      `Monitoring session with session ID ${sessionId} already exists within the session manager`
    );
    this.monitoringSessions.set(sessionId, monitoringSession);
    for (const monitoredLocation of monitoringSession.getMonitoredLocations().keys()) {
      this.incrementLocationCount(monitoredLocation, 1);
    }
    monitoringSession.addOnAddedMonitoredLocationObserver(this.onAddedMonitoredLocationObserver);
    monitoringSession.addOnRemovedMonitoredLocationObserver(this.onRemovedMonitoredLocationObserver);
  }
  public removeMonitoringSession(sessionId: string): void {
    const monitoringSession: MonitoringManager | undefined = this.monitoringSessions.get(sessionId);
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

  public getMonitoredLocations(): string[] {
    const monitoredLocations: string[] = [];
    for (const location of this.sessionMonitoringLocationCounts.keys()) {
      const monitoringCount: number | undefined = this.sessionMonitoringLocationCounts.get(location);
      console.log(`${location} has ${monitoringCount} sessions monitoring it.`);
      if (monitoringCount !== undefined) {
        if (monitoringCount > 0) {
          monitoredLocations.push(location);
        }
      } else {
        throw new Error(`Has key ${location} but count is ${monitoringCount}`);
      }
    }
    return monitoredLocations;
  }

  private removeMonitoredLocation(monitor: MonitorMetadata) {
    this.incrementLocationCountFromMonitor(monitor, -1);
  }

  private addMonitoredLocation(monitor: MonitorMetadata) {
    if (!(monitor.location in this.sessionMonitoringLocationCounts)) {
      this.sessionMonitoringLocationCounts.set(monitor.location, 1);
    } else {
      this.incrementLocationCountFromMonitor(monitor, 1);
    }
  }
}
export {MonitoringSessionManager};
export default MonitoringSessionManager;
