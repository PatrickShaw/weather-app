/**
 * Class used to hold error to be sent to frontend after a request from the frontend.
 */
class RequestError {
  public readonly message;
  public readonly stackMessage;

  constructor(stackMessage: string, message: string) {
    this.message = message;
    this.stackMessage = stackMessage;

  }
}

export {RequestError};
export default RequestError;
