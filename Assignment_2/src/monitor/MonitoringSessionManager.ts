import {MonitoringManager} from './MonitoringManager';
class MonitoringSessionManager {
  private monitoringSessions: Map<string, MonitoringManager>;
  private sessionMonitoringLocationCounts: Map<string, number>;
  constructor() {
    this.monitoringSessions = new Map<string, MonitoringManager>();
    this.sessionMonitoringLocationCounts = new Map<string, number>();
  }
  public getMonitoringSession(sessionId: string): MonitoringManager {
    return this.monitoringSessions.get(sessionId);
  }

  public addMonitoringSession(sessionId: string, monitoringSession: MonitoringManager): void {
    console.assert(
      !(sessionId in this.monitoringSessions), 
      `Monitoring session with session ID ${sessionId} already exists within the session manager`
    );
    this.monitoringSessions.set(sessionId, monitoringSession);
    for (const monitoredLocation of monitoringSession.getMonitoredLocations()) {
      const sessionMonitoringLocationCount: number = this.sessionMonitoringLocationCounts.get(monitoredLocation);
      this.sessionMonitoringLocationCounts.set(monitoredLocation, sessionMonitoringLocationCount + 1);
    }
  }
  public removeMonitoringSession(sessionId: string): void {
    console.assert(
      sessionId in this.monitoringSessions,
      `No monitoring session with session id ${sessionId}`
    );
    const monitoringSession: MonitoringManager = this.monitoringSessions.get(sessionId);
    this.monitoringSessions.delete(sessionId);
    for (const monitoredLocation of monitoringSession.getMonitoredLocations()) {
      const sessionMonitoringLocationCount: number = this.sessionMonitoringLocationCounts.get(monitoredLocation);
      this.sessionMonitoringLocationCounts.set(monitoredLocation, sessionMonitoringLocationCount - 1);
    }
  }
  public getMonitoredLocations(): string[] {
    const monitoredLocations: string[] = [];
    for (const location of this.sessionMonitoringLocationCounts.keys()) {
      const monitoringCount = this.sessionMonitoringLocationCounts.get(location);
      if (monitoringCount > 0) {
        monitoredLocations.push(location);
      }
    }
    return monitoredLocations;
  }
}
export {MonitoringSessionManager};
export default MonitoringSessionManager;
