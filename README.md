# @ws-fabric/status-indicator

> A standalone WebSocket status indicator component for React with auto-reconnection logic

[![npm version](https://badge.fury.io/js/%40ws-fabric%2Fstatus-indicator.svg)](https://www.npmjs.com/package/@ws-fabric/status-indicator)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 📚 Documentation

Comprehensive documentation is available in [docs/COMPLETE_GUIDE.md](docs/COMPLETE_GUIDE.md).

A lightweight, framework-agnostic React component library for displaying real-time WebSocket connection states with built-in auto-reconnection and exponential backoff.

## Features

- **Connection State Display** - Visual indicators for all WebSocket states
- **Auto-Reconnection** - Configurable reconnection with exponential backoff
- **Event Callbacks** - Full WebSocket event lifecycle hooks
- **Customizable Styling** - Props for colors, labels, sizes, and layouts
- **Framework Agnostic** - Core logic separated from React (Vue/Svelte versions planned)
- **TypeScript Support** - Full type definitions included
- **Accessible** - ARIA labels and semantic HTML
- **Tree Shakeable** - Minimal bundle impact

## Installation

```bash
npm install @ws-fabric/status-indicator
# or
yarn add @ws-fabric/status-indicator
# or
pnpm add @ws-fabric/status-indicator
```

## Quick Start

### Basic Usage

```tsx
import { WebSocketStatus, useWebSocket } from '@ws-fabric/status-indicator';

function App() {
  const { state, isConnected, connect, disconnect } = useWebSocket({
    url: 'wss://echo.websocket.org',
  });

  return (
    <div>
      <WebSocketStatus state={state} />
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

### Using the Provider Pattern

```tsx
import { WebSocketProvider, WebSocketStatusAuto } from '@ws-fabric/status-indicator';

function App() {
  return (
    <WebSocketProvider options={{ url: 'wss://echo.websocket.org' }}>
      <Header />
      <Content />
    </WebSocketProvider>
  );
}

function Header() {
  // Auto-reads state from context
  return <WebSocketStatusAuto />;
}
```

## Component API

### `WebSocketStatus`

Main status indicator component.

```tsx
interface WebSocketStatusProps {
  state: ConnectionState;
  layout?: 'horizontal' | 'vertical';
  size?: number; // 0.5 - 2 (default: 1)
  hideText?: boolean;
  hideIcon?: boolean;
  useDot?: boolean;
  labels?: {
    connected?: string;
    connecting?: string;
    reconnecting?: string;
    disconnected?: string;
    error?: string;
  };
  reconnectionAttempt?: number;
  showAttempt?: boolean;
  className?: string;
  colors?: {
    connected?: string;
    connecting?: string;
    reconnecting?: string;
    disconnected?: string;
    error?: string;
  };
  children?: React.ReactNode;
}
```

### `useWebSocket` Hook

Hook for managing WebSocket connections.

```tsx
interface WebSocketOptions {
  url: string;
  protocols?: string | string[];
  reconnection?: {
    enabled?: boolean;
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    jitter?: boolean;
  };
  immediate?: boolean;
  onOpen?: (event) => void;
  onMessage?: (event) => void;
  onError?: (event) => void;
  onClose?: (event) => void;
}

interface UseWebSocketReturn {
  ws: WebSocket | null;
  state: ConnectionState;
  isConnected: boolean;
  isConnecting: boolean;
  reconnectionAttempt: number;
  stats: {
    connections: number;
    reconnectionAttempts: number;
    messagesReceived: number;
    messagesSent: number;
    lastConnectedAt: number | null;
    lastDisconnectedAt: number | null;
    uptime: number;
  };
  send: (data) => void;
  connect: () => void;
  disconnect: (code?, reason?) => void;
  resetReconnection: () => void;
}
```

## Examples

### Custom Styling

```tsx
<WebSocketStatus
  state={state}
  useDot
  colors={{
    connected: '#00ff88',
    disconnected: '#ff4444',
  }}
  labels={{
    connected: 'Online',
    disconnected: 'Offline',
  }}
/>
```

### Size Variants

```tsx
<WebSocketStatus state={state} size={0.5} />  // Small
<WebSocketStatus state={state} size={1} />    // Default
<WebSocketStatus state={state} size={1.5} />  // Large
<WebSocketStatus state={state} size={2} />    // Extra Large
```

### Layout Variants

```tsx
<WebSocketStatus state={state} layout="horizontal" />
<WebSocketStatus state={state} layout="vertical" />
```

### Minimal/Compact

```tsx
// Icon only
<WebSocketStatus state={state} hideText />

// Dot only
<WebSocketStatus state={state} hideText useDot />

// Text only
<WebSocketStatus state={state} hideIcon />
```

### Conditional Rendering

```tsx
import { WebSocketStatusConnected, WebSocketStatusDisconnected } from '@ws-fabric/status-indicator';

function ChatApp() {
  return (
    <WebSocketProvider options={{ url: 'ws://localhost:8080' }}>
      <WebSocketStatusDisconnected>
        <div className="reconnect-prompt">
          <p>Connection lost. Reconnecting...</p>
        </div>
      </WebSocketStatusDisconnected>

      <WebSocketStatusConnected>
        <ChatInterface />
      </WebSocketStatusConnected>

      <WebSocketStatusAuto useDot />
    </WebSocketProvider>
  );
}
```

### Sending Messages

```tsx
function ChatExample() {
  const { send, isConnected, state } = useWebSocket({
    url: 'ws://localhost:8080',
  });

  const handleSend = (message: string) => {
    if (isConnected) {
      send(JSON.stringify({ type: 'chat', message }));
    }
  };

  return (
    <>
      <WebSocketStatus state={state} />
      <button onClick={() => handleSend('Hello!')} disabled={!isConnected}>
        Send
      </button>
    </>
  );
}
```

## Connection States

| State | Description | Default Icon |
|-------|-------------|--------------|
| `connecting` | Initial connection attempt | Loading spinner |
| `connected` | Successfully connected | WiFi icon |
| `disconnected` | Disconnected (user or error) | WiFi-off icon |
| `reconnecting` | Auto-reconnecting | Loading spinner |
| `error` | Connection error | Error icon |

## Reconnection Configuration

The default reconnection settings:

```tsx
const defaults = {
  enabled: true,           // Auto-reconnect on disconnect
  maxAttempts: -1,         // Infinite attempts (-1)
  initialDelay: 1000,      // Start with 1 second delay
  maxDelay: 30000,         // Max 30 second delay
  backoffMultiplier: 2,    // Double each attempt
  jitter: true,            // Add randomness to prevent thundering herd
};
```

Override defaults:

```tsx
useWebSocket({
  url: 'ws://localhost:8080',
  reconnection: {
    enabled: true,
    maxAttempts: 5,        // Give up after 5 attempts
    initialDelay: 2000,    // Start with 2 seconds
  },
});
```

## Styles

Import the base styles for animations and responsive behavior:

```tsx
import '@ws-fabric/status-indicator/styles';
```

Or use your own styling - the component uses standard HTML elements with predictable class names:

- `.ws-status` - Container
- `.ws-status-dot` - Status dot
- `.ws-status-icon` - SVG icon
- `.ws-status-text` - Text label

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## TypeScript

This package is written in TypeScript and includes full type definitions. All types are exported:

```tsx
import type {
  ConnectionState,
  ConnectionStats,
  ReconnectionOptions,
  WebSocketOptions,
  UseWebSocketReturn,
  WebSocketStatusProps,
  // ... and more
} from '@ws-fabric/status-indicator';
```

## Development

```bash
# Clone the repository
git clone https://github.com/ws-fabric/status-indicator

# Install dependencies
npm install

# Build the package
npm run build

# Run Storybook
npm run storybook

# Run examples
cd examples/react
npm install
npm run dev
```

## License

MIT [^1]

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

[^1]: See LICENSE file for details.
