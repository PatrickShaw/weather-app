/**
 * Interface for a listener when locations are retrieved form the SOAP client.
 */
interface OnLocationsRetrievedListener {
  // Called when locations are retrieved.
  onLocationsRetrieved(locations: string[]);
}

export {OnLocationsRetrievedListener};
export default OnLocationsRetrievedListener;
