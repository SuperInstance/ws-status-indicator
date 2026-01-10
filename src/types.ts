/**
 * Represents the current state of the WebSocket connection
 */
export type ConnectionState =
  | 'connecting'    // Initial connection attempt
  | 'connected'     // Successfully connected
  | 'disconnected'  // Intentionally disconnected or connection lost
  | 'reconnecting'  // Attempting to reconnect after disconnection
  | 'error';        // Connection error occurred

/**
 * Options for configuring the reconnection behavior
 */
export interface ReconnectionOptions {
  /** Whether to automatically attempt reconnection on disconnect */
  enabled: boolean;
  /** Maximum number of reconnection attempts (-1 for infinite) */
  maxAttempts: number;
  /** Initial delay before first reconnection attempt (ms) */
  initialDelay: number;
  /** Maximum delay between reconnection attempts (ms) */
  maxDelay: number;
  /** Multiplier for exponential backoff */
  backoffMultiplier: number;
  /** Whether to add jitter to delay (randomization to prevent thundering herd) */
  jitter: boolean;
}

/**
 * Options for configuring the WebSocket connection
 */
export interface WebSocketOptions {
  /** WebSocket URL (e.g., ws://localhost:8080 or wss://example.com) */
  url: string;
  /** WebSocket protocols to use */
  protocols?: string | string[];
  /** Reconnection configuration */
  reconnection?: Partial<ReconnectionOptions>;
  /** Whether to connect immediately on mount */
  immediate?: boolean;
  /** Custom WebSocket class (for testing or polyfills) */
  WebSocketClass?: typeof WebSocket;
  /** Event callbacks */
  onOpen?: (event: WebSocketEventMap['open']) => void;
  onMessage?: (event: WebSocketEventMap['message']) => void;
  onError?: (event: WebSocketEventMap['error']) => void;
  onClose?: (event: WebSocketEventMap['close']) => void;
  onConnecting?: () => void;
  onReconnecting?: (attempt: number) => void;
}

/**
 * Statistics about the WebSocket connection
 */
export interface ConnectionStats {
  /** Total number of successful connections */
  connections: number;
  /** Number of reconnection attempts made */
  reconnectionAttempts: number;
  /** Number of messages received */
  messagesReceived: number;
  /** Number of messages sent */
  messagesSent: number;
  /** Timestamp of last successful connection */
  lastConnectedAt: number | null;
  /** Timestamp of last disconnection */
  lastDisconnectedAt: number | null;
  /** Current uptime in milliseconds */
  uptime: number;
}

/**
 * Return value of the useWebSocket hook
 */
export interface UseWebSocketReturn {
  /** Current WebSocket instance */
  ws: WebSocket | null;
  /** Current connection state */
  state: ConnectionState;
  /** Whether the WebSocket is currently connected */
  isConnected: boolean;
  /** Whether the WebSocket is currently connecting or reconnecting */
  isConnecting: boolean;
  /** Current reconnection attempt number (0-based) */
  reconnectionAttempt: number;
  /** Connection statistics */
  stats: ConnectionStats;
  /** Send data through the WebSocket */
  send: (data: string | ArrayBuffer | Blob) => void;
  /** Manually connect the WebSocket */
  connect: () => void;
  /** Manually disconnect the WebSocket */
  disconnect: (code?: number, reason?: string) => void;
  /** Reset reconnection attempt counter */
  resetReconnection: () => void;
}

/**
 * Props for the StatusDot component
 */
export interface StatusDotProps {
  /** Current connection state */
  state: ConnectionState;
  /** Size of the dot in pixels */
  size?: number;
  /** Additional CSS classes for styling */
  className?: string;
  /** Custom color for each state */
  colors?: {
    connected?: string;
    connecting?: string;
    reconnecting?: string;
    disconnected?: string;
    error?: string;
  };
}

/**
 * Props for the StatusIcon component
 */
export interface StatusIconProps {
  /** Current connection state */
  state: ConnectionState;
  /** Size of the icon (affects width/height) */
  size?: number;
  /** Additional CSS classes for styling */
  className?: string;
  /** Whether to show animation */
  animated?: boolean;
}

/**
 * Props for the StatusText component
 */
export interface StatusTextProps {
  /** Current connection state */
  state: ConnectionState;
  /** Custom text for each state */
  labels?: {
    connected?: string;
    connecting?: string;
    reconnecting?: string;
    disconnected?: string;
    error?: string;
  };
  /** Whether to show the reconnection attempt number */
  showAttempt?: boolean;
  /** Current reconnection attempt number */
  reconnectionAttempt?: number;
  /** Additional CSS classes for styling */
  className?: string;
}

/**
 * Layout variants for the WebSocketStatus component
 */
export type StatusLayout = 'horizontal' | 'vertical';

/**
 * Props for the main WebSocketStatus component
 */
export interface WebSocketStatusProps {
  /** Current connection state */
  state: ConnectionState;
  /** Layout arrangement */
  layout?: StatusLayout;
  /** Size multiplier (0.5 - 2) */
  size?: number;
  /** Whether to hide the text label */
  hideText?: boolean;
  /** Whether to hide the icon/dot */
  hideIcon?: boolean;
  /** Whether to use a simple dot instead of icon */
  useDot?: boolean;
  /** Custom text labels */
  labels?: StatusTextProps['labels'];
  /** Current reconnection attempt number */
  reconnectionAttempt?: number;
  /** Whether to show reconnection attempt in text */
  showAttempt?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
  /** Custom colors */
  colors?: StatusDotProps['colors'];
  /** Children for custom rendering */
  children?: React.ReactNode;
}

/**
 * Props for the WebSocketProvider component
 */
export interface WebSocketProviderProps {
  /** WebSocket configuration options */
  options: WebSocketOptions;
  /** React children */
  children: React.ReactNode;
}

/**
 * Props for the WebSocketStatusConnected component
 */
export interface WebSocketStatusConnectedProps {
  /** Children to render when connected */
  children: React.ReactNode;
  /** Fallback content when disconnected */
  fallback?: React.ReactNode;
}

/**
 * Props for the WebSocketStatusDisconnected component
 */
export interface WebSocketStatusDisconnectedProps {
  /** Children to render when disconnected */
  children: React.ReactNode;
  /** Fallback content when connected */
  fallback?: React.ReactNode;
}
