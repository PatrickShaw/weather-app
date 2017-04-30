import {RequestError} from './RequestError';
/**
 * Class used to hold response to be sent to frontend after a request from the frontend.
 */
class RequestResponse<T> {
  public readonly data?: T;
  public readonly error?: RequestError;
  constructor(data: T, error: RequestError) {
    this.data = data;
    this.error = error;
  }
}

export {RequestResponse};
export default RequestResponse;
