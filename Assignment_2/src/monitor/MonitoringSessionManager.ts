import {MonitoringManager} from './MonitoringManager';
class MonitoringSessionManager {
  private monitoringSessions: Map<number, MonitoringManager>;
  private sessionMonitoringLocationCounts: Map<string, number>;
  constructor() {
    this.monitoringSessions = new Map<number, MonitoringManager>();
    this.sessionMonitoringLocationCounts = new Map<string, number>();
  }
  public addMonitoringSession(sessionId: number, monitoringSession: MonitoringManager): void {
    console.assert(
      !(sessionId in this.monitoringSessions), 
      `Monitoring session with session ID ${sessionId} already exists within the session manager`
    );
    this.monitoringSessions.set(sessionId, monitoringSession);
    for (let monitoredLocation of monitoringSession.getMonitoredLocations()) {
      let sessionMonitoringLocationCount: number = this.sessionMonitoringLocationCounts.get(monitoredLocation);
      this.sessionMonitoringLocationCounts.set(monitoredLocation, sessionMonitoringLocationCount + 1);
    }
  }
  public removeMonitoringSession(sessionId: number): void {
    console.assert(
      sessionId in this.monitoringSessions,
      `No monitoring session with session id ${sessionId}`
    );
    let monitoringSession: MonitoringManager = this.monitoringSessions.get(sessionId);
    this.monitoringSessions.delete(sessionId);
    for (let monitoredLocation of monitoringSession.getMonitoredLocations()) {
      let sessionMonitoringLocationCount: number = this.sessionMonitoringLocationCounts.get(monitoredLocation);
      this.sessionMonitoringLocationCounts.set(monitoredLocation, sessionMonitoringLocationCount - 1);
    }
  }
  public getMonitoredLocations(): string[] {
    let monitoredLocations: string[] = [];
    for (let location of this.sessionMonitoringLocationCounts.keys()) {
      let monitoringCount = this.sessionMonitoringLocationCounts.get(location);
      if (monitoringCount > 0) {
        monitoredLocations.push(location);
      }
    }
    return monitoredLocations;
  }
}
export {MonitoringSessionManager};
export default MonitoringSessionManager;
