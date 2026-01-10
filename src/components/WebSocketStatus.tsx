import React, { createContext, useContext } from 'react';
import {
  WebSocketStatusProps,
  WebSocketProviderProps,
  WebSocketStatusConnectedProps,
  WebSocketStatusDisconnectedProps,
} from '../types';
import { DEFAULT_STATE_COLORS, DEFAULT_STATE_LABELS } from '../constants';
import { StatusDot } from './StatusDot';
import { StatusIcon } from './StatusIcon';
import { StatusText } from './StatusText';
import { useWebSocket } from '../hooks/useWebSocket';
import { cn } from '../utils/cn';

/**
 * Context for sharing WebSocket state across components
 */
const WebSocketContext = createContext<ReturnType<typeof useWebSocket> | null>(null);

/**
 * Hook to access WebSocket context
 * @throws Error if used outside WebSocketProvider
 */
export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
}

/**
 * Provider component that wraps children with WebSocket context
 *
 * @example
 * ```tsx
 * <WebSocketProvider options={{ url: 'ws://localhost:8080' }}>
 *   <YourApp />
 * </WebSocketProvider>
 * ```
 */
export function WebSocketProvider({ options, children }: WebSocketProviderProps) {
  const ws = useWebSocket(options);

  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
}

/**
 * Main WebSocket status indicator component
 * Displays connection state with icon, dot, and text
 *
 * @example
 * ```tsx
 * // Standalone usage with controlled state
 * <WebSocketStatus state="connected" />
 *
 * // With custom labels and colors
 * <WebSocketStatus
 *   state="connected"
 *   labels={{ connected: 'Online' }}
 *   colors={{ connected: '#00ff00' }}
 * />
 *
 * // With useWebSocket hook
 * const { state, reconnectionAttempt } = useWebSocket({ url: 'ws://localhost:8080' });
 * <WebSocketStatus state={state} reconnectionAttempt={reconnectionAttempt} />
 * ```
 */
export function WebSocketStatus({
  state,
  layout = 'horizontal',
  size = 1,
  hideText = false,
  hideIcon = false,
  useDot = false,
  labels,
  reconnectionAttempt,
  showAttempt = false,
  className,
  colors,
  children,
}: WebSocketStatusProps) {
  const sizeClasses = {
    '0.5': 'text-xs gap-1',
    '0.75': 'text-sm gap-1.5',
    '1': 'text-sm gap-2',
    '1.25': 'text-base gap-2',
    '1.5': 'text-lg gap-2.5',
    '2': 'text-xl gap-3',
  } as const;

  const layoutClasses = {
    horizontal: 'flex-row items-center',
    vertical: 'flex-col items-start',
  };

  const stateColor = colors?.[state] || DEFAULT_STATE_COLORS[state];

  return (
    <div
      className={cn(
        'ws-status',
        'inline-flex',
        layoutClasses[layout],
        sizeClasses[String(size) as keyof typeof sizeClasses] || sizeClasses['1'],
        className
      )}
      role="status"
      aria-live="polite"
    >
      {!hideIcon && (
        <>
          {useDot ? (
            <StatusDot state={state} size={Math.round(8 * size)} colors={colors} />
          ) : (
            <StatusIcon state={state} size={Math.round(16 * size)} />
          )}
        </>
      )}
      {!hideText && (
        <StatusText
          state={state}
          labels={labels}
          showAttempt={showAttempt}
          reconnectionAttempt={reconnectionAttempt}
          className="font-medium"
        />
      )}
      {children}
    </div>
  );
}

/**
 * Conditional rendering: show children only when connected
 *
 * @example
 * ```tsx
 * <WebSocketStatusConnected>
 *   <ChatMessages />
 * </WebSocketStatusConnected>
 * ```
 */
export function WebSocketStatusConnected({
  children,
  fallback = null,
}: WebSocketStatusConnectedProps) {
  const { isConnected } = useWebSocketContext();

  if (isConnected) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}

/**
 * Conditional rendering: show children only when disconnected
 *
 * @example
 * ```tsx
 * <WebSocketStatusDisconnected>
 *   <ReconnectPrompt />
 * </WebSocketStatusDisconnected>
 * ```
 */
export function WebSocketStatusDisconnected({
  children,
  fallback = null,
}: WebSocketStatusDisconnectedProps) {
  const { isConnected } = useWebSocketContext();

  if (!isConnected) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}

/**
 * Convenience component that uses context automatically
 * Displays status based on the WebSocketProvider connection
 *
 * @example
 * ```tsx
 * <WebSocketProvider options={{ url: 'ws://localhost:8080' }}>
 *   <WebSocketStatusAuto />
 * </WebSocketProvider>
 * ```
 */
export function WebSocketStatusAuto(props: Omit<WebSocketStatusProps, 'state'>) {
  const { state, reconnectionAttempt } = useWebSocketContext();

  return (
    <WebSocketStatus
      state={state}
      reconnectionAttempt={reconnectionAttempt}
      {...props}
    />
  );
}
