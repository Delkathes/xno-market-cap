/**
 * Security headers for API responses
 */

export const securityHeaders: Record<string, string> = {
  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",
  // Prevent clickjacking
  "X-Frame-Options": "DENY",
  // XSS protection (legacy but still useful)
  "X-XSS-Protection": "1; mode=block",
  // Referrer policy
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Content Security Policy for API
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
}

export function getSecurityHeaders(): Record<string, string> {
  return { ...securityHeaders }
}
