/**
 * Authvia REST defaults for Lambda proxy responses.
 * No Server / X-Powered-By (PenTest STEW-3833 info disclosure).
 * No deprecated X-XSS-Protection.
 */
export const AUTHVIA_REST_SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'X-Frame-Options': 'DENY',
  'Content-Type': 'application/json',
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, PATCH, DELETE, OPTIONS',
  'Content-Security-Policy':
    "default-src 'self'; form-action 'self'; object-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests; block-all-mixed-content",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
};

export function authviaRestSecurityHeaders(
  overrides?: Record<string, string>,
): Record<string, string> {
  return { ...AUTHVIA_REST_SECURITY_HEADERS, ...(overrides ?? {}) };
}
