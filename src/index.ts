// Components
export {
  StatusDot,
  StatusIcon,
  StatusText,
  WebSocketStatus,
  WebSocketProvider,
  WebSocketStatusAuto,
  WebSocketStatusConnected,
  WebSocketStatusDisconnected,
  useWebSocketContext,
} from './components';

// Hooks
export {
  useWebSocket,
} from './hooks';

// Types
export type {
  // Connection types
  ConnectionState,
  ConnectionStats,
  ReconnectionOptions,
  WebSocketOptions,
  UseWebSocketReturn,

  // Component props
  StatusDotProps,
  StatusIconProps,
  StatusTextProps,
  WebSocketStatusProps,
  WebSocketProviderProps,
  WebSocketStatusConnectedProps,
  WebSocketStatusDisconnectedProps,
  StatusLayout,
} from './types';

// Constants
export {
  DEFAULT_RECONNECTION_OPTIONS,
  DEFAULT_STATE_COLORS,
  DEFAULT_STATE_LABELS,
  STATE_ARIA_LABELS,
} from './constants';

// Styles
import './styles.css';
