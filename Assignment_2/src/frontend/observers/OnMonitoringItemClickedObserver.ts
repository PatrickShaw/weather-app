interface OnMonitoringItemClickedObserver {
  /**
   * Occurs when a user clicks on an item that has an associated view attached to it.
   */
  onItemClicked(prefixedLocation: string): void;
}
export {OnMonitoringItemClickedObserver};
export default OnMonitoringItemClickedObserver;
