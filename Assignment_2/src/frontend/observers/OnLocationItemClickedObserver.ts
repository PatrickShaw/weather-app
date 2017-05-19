interface OnLocationItemClickedObserver {
  /**
   * Occurs when a user clicks on an item that has an associated view attached to it.
   */
  onItemClicked(location: string, selected: boolean): void;
}
export {OnLocationItemClickedObserver};
export default OnLocationItemClickedObserver;
