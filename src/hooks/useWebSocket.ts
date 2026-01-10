import { useCallback, useEffect, useRef, useState } from 'react';
import { ConnectionState, ConnectionStats, UseWebSocketReturn, WebSocketOptions, ReconnectionOptions } from '../types';
import { DEFAULT_RECONNECTION_OPTIONS } from '../constants';

/**
 * Calculate delay for next reconnection attempt with exponential backoff
 */
function calculateReconnectionDelay(
  attempt: number,
  options: ReconnectionOptions
): number {
  const baseDelay = Math.min(
    options.initialDelay * Math.pow(options.backoffMultiplier, attempt),
    options.maxDelay
  );

  if (options.jitter) {
    // Add +/- 25% random jitter
    const jitterFactor = 0.75 + Math.random() * 0.5;
    return Math.floor(baseDelay * jitterFactor);
  }

  return baseDelay;
}

/**
 * A custom hook for managing WebSocket connections with auto-reconnection
 *
 * @param options - WebSocket configuration options
 * @returns WebSocket control interface
 *
 * @example
 * ```tsx
 * const { ws, state, isConnected, send, connect, disconnect } = useWebSocket({
 *   url: 'ws://localhost:8080',
 *   reconnection: { maxAttempts: 5 }
 * });
 * ```
 */
export function useWebSocket(options: WebSocketOptions): UseWebSocketReturn {
  const {
    url,
    protocols,
    reconnection: reconnectionOverrides,
    immediate = true,
    WebSocketClass = WebSocket,
    onOpen,
    onMessage,
    onError,
    onClose,
    onConnecting,
    onReconnecting,
  } = options;

  const reconnection: ReconnectionOptions = {
    ...DEFAULT_RECONNECTION_OPTIONS,
    ...reconnectionOverrides,
  };

  // WebSocket instance ref
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uptimeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Connection state
  const [state, setState] = useState<ConnectionState>(
    immediate ? 'connecting' : 'disconnected'
  );
  const [reconnectionAttempt, setReconnectionAttempt] = useState(0);

  // Statistics
  const [stats, setStats] = useState<ConnectionStats>({
    connections: 0,
    reconnectionAttempts: 0,
    messagesReceived: 0,
    messagesSent: 0,
    lastConnectedAt: null,
    lastDisconnectedAt: null,
    uptime: 0,
  });

  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update uptime every second when connected
  useEffect(() => {
    if (state === 'connected') {
      uptimeIntervalRef.current = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
    } else {
      if (uptimeIntervalRef.current) {
        clearInterval(uptimeIntervalRef.current);
        uptimeIntervalRef.current = null;
      }
    }

    return () => {
      if (uptimeIntervalRef.current) {
        clearInterval(uptimeIntervalRef.current);
      }
    };
  }, [state]);

  // Calculate uptime
  useEffect(() => {
    if (stats.lastConnectedAt && state === 'connected') {
      setStats((prev) => ({
        ...prev,
        uptime: Date.now() - stats.lastConnectedAt!,
      }));
    }
  }, [currentTime, stats.lastConnectedAt, state]);

  // Clear pending reconnection timeout
  const clearReconnectionTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Attempt reconnection with exponential backoff
  const scheduleReconnection = useCallback(() => {
    if (!reconnection.enabled) {
      setState('disconnected');
      setReconnectionAttempt(0);
      return;
    }

    if (
      reconnection.maxAttempts !== -1 &&
      reconnectionAttempt >= reconnection.maxAttempts
    ) {
      setState('disconnected');
      setReconnectionAttempt(0);
      return;
    }

    const delay = calculateReconnectionDelay(reconnectionAttempt, reconnection);

    setState('reconnecting');
    onReconnecting?.(reconnectionAttempt + 1);

    setStats((prev) => ({
      ...prev,
      reconnectionAttempts: prev.reconnectionAttempts + 1,
    }));

    reconnectTimeoutRef.current = setTimeout(() => {
      setReconnectionAttempt((prev) => prev + 1);
      connect();
    }, delay);
  }, [reconnection, reconnectionAttempt, onReconnecting]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    clearReconnectionTimeout();

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setState('connecting');
      onConnecting?.();

      const ws = new WebSocketClass(url, protocols);
      wsRef.current = ws;

      ws.onopen = (event) => {
        setState('connected');
        setReconnectionAttempt(0);
        setStats((prev) => ({
          ...prev,
          connections: prev.connections + 1,
          lastConnectedAt: Date.now(),
          uptime: 0,
        }));
        onOpen?.(event);
      };

      ws.onmessage = (event) => {
        setStats((prev) => ({
          ...prev,
          messagesReceived: prev.messagesReceived + 1,
        }));
        onMessage?.(event);
      };

      ws.onerror = (event) => {
        setState('error');
        onError?.(event);
      };

      ws.onclose = (event) => {
        setStats((prev) => ({
          ...prev,
          lastDisconnectedAt: Date.now(),
          uptime: 0,
        }));

        wsRef.current = null;
        onClose?.(event);

        // Only attempt reconnection if not manually closed
        if (!event.wasClean) {
          scheduleReconnection();
        } else {
          setState('disconnected');
          setReconnectionAttempt(0);
        }
      };
    } catch (error) {
      setState('error');
      console.error('WebSocket connection error:', error);
    }
  }, [
    url,
    protocols,
    WebSocketClass,
    onOpen,
    onMessage,
    onError,
    onClose,
    onConnecting,
    clearReconnectionTimeout,
    scheduleReconnection,
  ]);

  // Disconnect from WebSocket
  const disconnect = useCallback(
    (code?: number, reason?: string) => {
      clearReconnectionTimeout();

      if (wsRef.current) {
        wsRef.current.close(code, reason);
        wsRef.current = null;
      }

      setState('disconnected');
      setReconnectionAttempt(0);
      setStats((prev) => ({
        ...prev,
        lastDisconnectedAt: Date.now(),
        uptime: 0,
      }));
    },
    [clearReconnectionTimeout]
  );

  // Send data through WebSocket
  const send = useCallback((data: string | ArrayBuffer | Blob) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(data);
      setStats((prev) => ({
        ...prev,
        messagesSent: prev.messagesSent + 1,
      }));
    } else {
      console.warn('Cannot send message: WebSocket is not connected');
    }
  }, []);

  // Reset reconnection attempt counter
  const resetReconnection = useCallback(() => {
    setReconnectionAttempt(0);
  }, []);

  // Initial connection effect
  useEffect(() => {
    if (immediate) {
      connect();
    }

    return () => {
      clearReconnectionTimeout();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate]);

  return {
    ws: wsRef.current,
    state,
    isConnected: state === 'connected',
    isConnecting: state === 'connecting' || state === 'reconnecting',
    reconnectionAttempt,
    stats,
    send,
    connect,
    disconnect,
    resetReconnection,
  };
}
