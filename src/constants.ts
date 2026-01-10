import { ReconnectionOptions, ConnectionState } from './types';

/**
 * Default reconnection options
 */
export const DEFAULT_RECONNECTION_OPTIONS: ReconnectionOptions = {
  enabled: true,
  maxAttempts: -1, // Infinite attempts
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
};

/**
 * Default state colors
 */
export const DEFAULT_STATE_COLORS = {
  connected: 'rgb(34, 197, 94)',      // green-500
  connecting: 'rgb(234, 179, 8)',     // yellow-500
  reconnecting: 'rgb(234, 179, 8)',   // yellow-500
  disconnected: 'rgb(239, 68, 68)',   // red-500
  error: 'rgb(220, 38, 38)',          // red-600
} as const;

/**
 * Default state labels
 */
export const DEFAULT_STATE_LABELS = {
  connected: 'Connected',
  connecting: 'Connecting...',
  reconnecting: 'Reconnecting...',
  disconnected: 'Disconnected',
  error: 'Connection Error',
} as const;

/**
 * Maps ConnectionState to accessible label for screen readers
 */
export const STATE_ARIA_LABELS: Record<ConnectionState, string> = {
  connected: 'WebSocket connected',
  connecting: 'WebSocket connecting',
  disconnected: 'WebSocket disconnected',
  reconnecting: 'WebSocket reconnecting',
  error: 'WebSocket connection error',
};
