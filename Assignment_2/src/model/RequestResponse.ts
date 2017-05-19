import {RequestError} from './RequestError';
/**
 * Class used to hold response to be sent to consumers of the API after a request from the frontend.
 */
class RequestResponse<T> {
  // The data that's actually supposed to be sent from to from the API.
  public readonly data: T;
  // The error provided to consumers of the API (if there was one).
  public readonly error: RequestError;
  constructor(data: T, error: RequestError) {
    this.data = data;
    this.error = error;
  }

  public toString(): string {
    const err: string = this.error ? `Message: ${this.error.message}, Stack: ${this.error.stackMessage}` : 'No error';
    const data: string = this.data ? this.data.toString() : 'No data';
    return `Error: ${err}, Data: ${data}`;
  } 
}

export {RequestResponse};
export default RequestResponse;
