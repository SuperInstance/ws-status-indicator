import React from 'react';
import { StatusDotProps } from '../types';
import { DEFAULT_STATE_COLORS } from '../constants';
import { cn } from '../utils/cn';

/**
 * A simple colored dot indicating connection state
 *
 * @example
 * ```tsx
 * <StatusDot state="connected" size={8} />
 * ```
 */
export function StatusDot({
  state,
  size = 8,
  className,
  colors = DEFAULT_STATE_COLORS,
}: StatusDotProps) {
  const getColor = () => {
    return colors[state] || colors.disconnected;
  };

  return (
    <span
      className={cn(
        'ws-status-dot',
        'inline-flex rounded-full',
        state === 'connecting' || state === 'reconnecting' ? 'animate-pulse' : '',
        className
      )}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: getColor(),
      }}
      aria-hidden="true"
    />
  );
}
