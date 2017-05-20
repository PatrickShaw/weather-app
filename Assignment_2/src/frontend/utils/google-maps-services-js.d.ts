declare module "@google/maps" {
  export interface CreateClientOptions {
    /**
     * API key (required, unless clientID and
     * clientSecret provided).
     */
    key: string;
    /**
     * Maps API for Work client ID.
     */
    clientId?: string;
    /**
     * Maps API for Work client secret (a.k.a. private key).
     */
    clientSecret?: string;
    /**
     * Maps API for Work channel.
     */
    channel?: string;
    /**
     * Timeout in milliseconds. (Default: 60 * 1000 ms)
     */
    timeout?: number;
    /**
     * Promise constructor (optional).
     * @constructor
     */
    Promise?: new<T>() => PromiseLike<T>;

    rate?: RateOptions;

    retryOptions?: RetryOptions;
  }

  export interface RateOptions {
    /**
     * Controls rate-limiting of requests. Maximum number of requests per period.
     * (Default: 10)
     */
    limit: number;
    /**
     * Period for rate limit, in milliseconds. (Default: 1000 ms)
     */
    period: number;
  }

  export interface RetryOptions {
    /**
     * If a transient server error
     * occurs, how long to wait before retrying the request, in milliseconds.
     * (Default: 500 ms)
     */
    interval: number;
  }

  export type MapApiResponseHandler<T> = (error: any, response: MapApiResponse<T>) => void;

  /**
   * HTTP Response of the API call
   */
  export interface MapApiResponse<T> {
    /**
     * HTTP Status Code
     */
    status: number;

    /**
     * HTTP Header object
     */
    headers: { [index: string]: string };

    /**
     * Payload of the API call
     */
    json: T;
  }

  /**
   * Payload of a Geocode response
   */
  interface GeoCodeResponsePayload {
    results: google.maps.GeocoderResult[];
    status: google.maps.GeocoderStatus;
  }

  export class GoogleMapsClient {
    /**
     * Call to the Geocode API
     */
    public geocode(request: google.maps.GeocoderRequest, callback: MapApiResponseHandler<GeoCodeResponsePayload>): void;
  }

  export function createClient(options: CreateClientOptions): GoogleMapsClient;

}