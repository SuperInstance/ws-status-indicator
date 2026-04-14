import { describe, it, expect } from 'vitest';
import {
  DEFAULT_RECONNECTION_OPTIONS,
  DEFAULT_STATE_COLORS,
  DEFAULT_STATE_LABELS,
  STATE_ARIA_LABELS,
} from '../constants';
import type { ConnectionState } from '../types';

describe('DEFAULT_RECONNECTION_OPTIONS', () => {
  it('has enabled set to true', () => {
    expect(DEFAULT_RECONNECTION_OPTIONS.enabled).toBe(true);
  });

  it('has maxAttempts set to -1 (infinite)', () => {
    expect(DEFAULT_RECONNECTION_OPTIONS.maxAttempts).toBe(-1);
  });

  it('has initialDelay of 1000ms', () => {
    expect(DEFAULT_RECONNECTION_OPTIONS.initialDelay).toBe(1000);
  });

  it('has maxDelay of 30000ms', () => {
    expect(DEFAULT_RECONNECTION_OPTIONS.maxDelay).toBe(30000);
  });

  it('has backoffMultiplier of 2', () => {
    expect(DEFAULT_RECONNECTION_OPTIONS.backoffMultiplier).toBe(2);
  });

  it('has jitter enabled', () => {
    expect(DEFAULT_RECONNECTION_OPTIONS.jitter).toBe(true);
  });
});

describe('DEFAULT_STATE_LABELS', () => {
  const states: ConnectionState[] = ['connecting', 'connected', 'disconnected', 'reconnecting', 'error'];

  it('has a label for every connection state', () => {
    states.forEach((state) => {
      expect(DEFAULT_STATE_LABELS[state]).toBeDefined();
      expect(typeof DEFAULT_STATE_LABELS[state]).toBe('string');
      expect(DEFAULT_STATE_LABELS[state].length).toBeGreaterThan(0);
    });
  });

  it('connected label is "Connected"', () => {
    expect(DEFAULT_STATE_LABELS.connected).toBe('Connected');
  });

  it('disconnected label is "Disconnected"', () => {
    expect(DEFAULT_STATE_LABELS.disconnected).toBe('Disconnected');
  });
});

describe('DEFAULT_STATE_COLORS', () => {
  const states: ConnectionState[] = ['connecting', 'connected', 'disconnected', 'reconnecting', 'error'];

  it('has a color for every connection state', () => {
    states.forEach((state) => {
      expect(DEFAULT_STATE_COLORS[state]).toBeDefined();
      expect(typeof DEFAULT_STATE_COLORS[state]).toBe('string');
    });
  });

  it('uses rgb format for connected color', () => {
    expect(DEFAULT_STATE_COLORS.connected).toMatch(/^rgb\(/);
  });

  it('uses rgb format for error color', () => {
    expect(DEFAULT_STATE_COLORS.error).toMatch(/^rgb\(/);
  });
});

describe('STATE_ARIA_LABELS', () => {
  const states: ConnectionState[] = ['connecting', 'connected', 'disconnected', 'reconnecting', 'error'];

  it('has an aria label for every connection state', () => {
    states.forEach((state) => {
      expect(STATE_ARIA_LABELS[state]).toBeDefined();
      expect(typeof STATE_ARIA_LABELS[state]).toBe('string');
    });
  });

  it('all aria labels mention WebSocket', () => {
    Object.values(STATE_ARIA_LABELS).forEach((label) => {
      expect(label.toLowerCase()).toContain('websocket');
    });
  });
});
