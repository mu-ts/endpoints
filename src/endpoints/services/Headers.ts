import { authviaRestSecurityHeaders } from './securityHeaders';

export abstract class Headers {

  private static defaults: {[key: string]: string} = {};

  private constructor() {}

  /**
   * Values set here can be overridden by the lambda implementation.
   *
   * Prefer {@link Headers.useAuthviaRestDefaults} or AUTHVIA_REST_SECURITY_HEADERS.
   * Do not set Server or X-Powered-By (information disclosure).
   * Prefer Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options,
   * Referrer-Policy, and Content-Security-Policy with frame-ancestors 'none'.
   *
   * @param defaults to set on every request.
   */
  public static default(defaults: {[key: string]: string}) {
    this.defaults = defaults;
  }

  /**
   * Install Authvia REST security headers as the library default (STEW-3833).
   */
  public static useAuthviaRestDefaults(overrides?: {[key: string]: string}): void {
    this.defaults = authviaRestSecurityHeaders(overrides);
  }

  public static get( overrides?: {[key: string]: string} ): {[key: string]: string} {
      return { ...this.defaults, ...overrides || {} };
  }
}
