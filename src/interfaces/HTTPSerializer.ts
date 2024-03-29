import { HTTPBody } from '../model';

export interface HTTPSerializer {
  /**
   * Called when the EndpointROuter creates an HTTPBody from the body
   * attribute of an HTTPEvent.
   *
   * @param event
   */
  deserializeBody(contentTypes: string | undefined, eventBody: string | undefined): HTTPBody | undefined;

  /**
   * Called to serialize the HTTPBody of a response into a string. Will
   * take care of redacting attributes marked with @redacted so that
   * bleeding of sensitive information does not happen.
   *
   * @param response
   */
  serializeResponse<T>(responseBody: HTTPBody, type: string | T | T[], scopes?: string | null | undefined, role?: string | null | undefined): string;
}
