import React from 'react';
import { StatusIconProps } from '../types';
import { cn } from '../utils/cn';

/**
 * WiFi icon (connected state)
 */
function WifiIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" />
    </svg>
  );
}

/**
 * WiFi Off icon (disconnected state)
 */
function WifiOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" />
    </svg>
  );
}

/**
 * Loading/Spinner icon (connecting state)
 */
function LoadingIcon({ className, animated = true }: { className?: string; animated?: boolean }) {
  return (
    <svg
      className={cn(className, animated && 'animate-spin')}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

/**
 * Error icon (error state)
 */
function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

/**
 * An icon component that displays the appropriate icon for each connection state
 *
 * @example
 * ```tsx
 * <StatusIcon state="connected" size={16} animated />
 * ```
 */
export function StatusIcon({
  state,
  size = 16,
  className,
  animated = true,
}: StatusIconProps) {
  const baseClassName = cn('ws-status-icon', className);
  const styleProp = { width: `${size}px`, height: `${size}px` };

  switch (state) {
    case 'connected':
      return <WifiIcon className={baseClassName} style={styleProp} />;
    case 'connecting':
    case 'reconnecting':
      return <LoadingIcon className={baseClassName} style={styleProp} animated={animated} />;
    case 'disconnected':
      return <WifiOffIcon className={baseClassName} style={styleProp} />;
    case 'error':
      return <ErrorIcon className={baseClassName} style={styleProp} />;
    default:
      return <WifiOffIcon className={baseClassName} style={styleProp} />;
  }
}
