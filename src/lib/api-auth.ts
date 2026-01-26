/**
 * API Authentication Utilities
 *
 * Provides shared authentication for protected API endpoints.
 * Uses Bearer token authentication with environment-specific API keys.
 */

import type { RequestEvent } from '@builder.io/qwik-city';

/**
 * API key types for different endpoint groups
 */
export type ApiKeyType =
  | 'ADMIN_API_KEY'      // For /api/admin/* endpoints
  | 'SYNC_API_KEY'       // For /api/*/sync endpoints (ERPNext webhooks)
  | 'IMPORT_API_KEY';    // For import endpoints (existing)

/**
 * Authentication result
 */
export interface AuthResult {
  authorized: boolean;
  error?: string;
  statusCode?: number;
}

/**
 * Check if a request is authorized using Bearer token authentication.
 *
 * Usage:
 * ```typescript
 * export const onPost: RequestHandler = async (requestEvent) => {
 *   const auth = checkApiAuth(requestEvent, 'ADMIN_API_KEY');
 *   if (!auth.authorized) {
 *     requestEvent.json(auth.statusCode || 401, { error: auth.error });
 *     return;
 *   }
 *   // ... handle authorized request
 * };
 * ```
 *
 * @param requestEvent - The Qwik City request event
 * @param keyType - Which API key to check against
 * @returns AuthResult indicating if the request is authorized
 */
export function checkApiAuth(
  requestEvent: RequestEvent,
  keyType: ApiKeyType
): AuthResult {
  const { request, platform } = requestEvent;

  // Get the expected API key from environment
  const expectedKey = platform.env?.[keyType] as string | undefined;

  if (!expectedKey) {
    console.error(`[API Auth] ${keyType} not configured in environment`);
    return {
      authorized: false,
      error: `${keyType} not configured`,
      statusCode: 500,
    };
  }

  // Check Authorization header
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return {
      authorized: false,
      error: 'Missing Authorization header',
      statusCode: 401,
    };
  }

  // Validate Bearer token format
  if (!authHeader.startsWith('Bearer ')) {
    return {
      authorized: false,
      error: 'Invalid Authorization format. Expected: Bearer <token>',
      statusCode: 401,
    };
  }

  const providedKey = authHeader.slice(7); // Remove 'Bearer ' prefix

  if (providedKey !== expectedKey) {
    return {
      authorized: false,
      error: 'Invalid API key',
      statusCode: 401,
    };
  }

  return { authorized: true };
}

/**
 * Helper to quickly reject unauthorized requests.
 * Returns true if unauthorized (and sends response), false if authorized.
 *
 * Usage:
 * ```typescript
 * export const onPost: RequestHandler = async (requestEvent) => {
 *   if (rejectUnauthorized(requestEvent, 'ADMIN_API_KEY')) return;
 *   // ... handle authorized request
 * };
 * ```
 */
export function rejectUnauthorized(
  requestEvent: RequestEvent,
  keyType: ApiKeyType
): boolean {
  const auth = checkApiAuth(requestEvent, keyType);

  if (!auth.authorized) {
    requestEvent.json(auth.statusCode || 401, { error: auth.error });
    return true;
  }

  return false;
}
