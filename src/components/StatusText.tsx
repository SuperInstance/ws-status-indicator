import React from 'react';
import { StatusTextProps } from '../types';
import { DEFAULT_STATE_LABELS } from '../constants';
import { cn } from '../utils/cn';

/**
 * Text component showing the current connection state
 *
 * @example
 * ```tsx
 * <StatusText state="connected" showAttempt reconnectionAttempt={2} />
 * ```
 */
export function StatusText({
  state,
  labels = DEFAULT_STATE_LABELS,
  showAttempt = false,
  reconnectionAttempt = 0,
  className,
}: StatusTextProps) {
  const getText = () => {
    let text = labels[state] || DEFAULT_STATE_LABELS[state];

    if (showAttempt && state === 'reconnecting' && reconnectionAttempt > 0) {
      text += ` (${reconnectionAttempt})`;
    }

    return text;
  };

  return (
    <span className={cn('ws-status-text', className)}>
      {getText()}
    </span>
  );
}
