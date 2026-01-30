/**
 * Type definitions for API services
 * Re-exports from shared types
 */

// Re-export all shared types
export * from './shared-types';

// API-specific types
import type { Context } from 'hono';
import type { Env } from './index';

export type AppContext = Context<{ Bindings: Env }>;

export interface WorkerRequest {
  ctx: AppContext;
}
