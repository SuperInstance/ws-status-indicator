# WebSocket Status Indicator - Complete Documentation

**React Component for Real-Time Connection States**

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Components](#components)
4. [Hooks](#hooks)
5. [API Reference](#api-reference)
6. [Usage Examples](#usage-examples)
7. [Styling](#styling)
8. [Advanced Topics](#advanced-topics)

---

## Overview

### What is @ws-fabric/status-indicator?

A React component library for displaying real-time WebSocket connection states with built-in auto-reconnection and exponential backoff.

### Key Features

- **Connection State Display**: Visual indicators for all WebSocket states
- **Auto-Reconnection**: Configurable reconnection with exponential backoff
- **Event Callbacks**: Full WebSocket event lifecycle hooks
- **Customizable Styling**: Props for colors, labels, sizes, and layouts
- **Framework Agnostic**: Core logic separated from React
- **TypeScript Support**: Full type definitions
- **Accessible**: ARIA labels and semantic HTML
- **Tree Shakeable**: Minimal bundle impact

### Connection States

| State | Description | Default Icon |
|-------|-------------|--------------|
| `connecting` | Initial connection attempt | Loading spinner |
| `connected` | Successfully connected | WiFi icon |
| `disconnected` | Disconnected (user or error) | WiFi-off icon |
| `reconnecting` | Auto-reconnecting | Loading spinner |
| `error` | Connection error | Error icon |

---

## Installation

### From npm

```bash
npm install @ws-fabric/status-indicator
# or
yarn add @ws-fabric/status-indicator
# or
pnpm add @ws-fabric/status-indicator
```

### Import Styles

```typescript
// Import base styles for animations
import '@ws-fabric/status-indicator/styles';
```

---

## Components

### WebSocketStatus

Main status indicator component.

```typescript
import { WebSocketStatus } from '@ws-fabric/status-indicator';

function App() {
  const state = 'connected'; // Your connection state

  return (
    <WebSocketStatus
      state={state}
      layout="horizontal"
      size={1}
    />
  );
}
```

#### Props

```typescript
interface WebSocketStatusProps {
  // Required
  state: ConnectionState;

  // Layout
  layout?: 'horizontal' | 'vertical';
  size?: number;                    // 0.5 - 2 (default: 1)
  hideText?: boolean;
  hideIcon?: boolean;
  useDot?: boolean;                 // Use dot instead of icon

  // Labels
  labels?: {
    connected?: string;
    connecting?: string;
    reconnecting?: string;
    disconnected?: string;
    error?: string;
  };

  // Reconnection
  reconnectionAttempt?: number;
  showAttempt?: boolean;

  // Styling
  colors?: {
    connected?: string;
    connecting?: string;
    reconnecting?: string;
    disconnected?: string;
    error?: string;
  };

  className?: string;
  children?: React.ReactNode;
}
```

### WebSocketStatusAuto

Automatically reads state from context.

```typescript
import { WebSocketProvider, WebSocketStatusAuto } from '@ws-fabric/status-indicator';

function App() {
  return (
    <WebSocketProvider options={{ url: 'wss://echo.websocket.org' }}>
      <Header />
    </WebSocketProvider>
  );
}

function Header() {
  // Automatically reads state from context
  return <WebSocketStatusAuto />;
}
```

### Conditional Rendering Components

Render children based on connection state.

```typescript
import {
  WebSocketStatusConnected,
  WebSocketStatusDisconnected
} from '@ws-fabric/status-indicator';

function ChatApp() {
  return (
    <WebSocketProvider options={{ url: 'ws://localhost:8080' }}>
      <WebSocketStatusDisconnected>
        <div className="reconnect-prompt">
          Connection lost. Reconnecting...
        </div>
      </WebSocketStatusDisconnected>

      <WebSocketStatusConnected>
        <ChatInterface />
      </WebSocketStatusConnected>
    </WebSocketProvider>
  );
}
```

---

## Hooks

### useWebSocket

Main hook for managing WebSocket connections.

```typescript
import { useWebSocket } from '@ws-fabric/status-indicator';

function ChatExample() {
  const { state, isConnected, send, connect, disconnect } = useWebSocket({
    url: 'ws://localhost:8080',
  });

  return (
    <>
      <WebSocketStatus state={state} />
      <button onClick={connect} disabled={isConnected}>
        Connect
      </button>
      <button onClick={disconnect} disabled={!isConnected}>
        Disconnect
      </button>
    </>
  );
}
```

#### Options

```typescript
interface WebSocketOptions {
  // Connection
  url: string;
  protocols?: string | string[];

  // Reconnection
  reconnection?: {
    enabled?: boolean;          // Default: true
    maxAttempts?: number;       // Default: -1 (infinite)
    initialDelay?: number;      // Default: 1000ms
    maxDelay?: number;          // Default: 30000ms
    backoffMultiplier?: number; // Default: 2
    jitter?: boolean;           // Default: true
  };

  // Auto-connect
  immediate?: boolean;          // Default: false

  // Event callbacks
  onOpen?: (event: WebSocketEventMap['open']) => void;
  onMessage?: (event: WebSocketEventMap['message']) => void;
  onError?: (event: WebSocketEventMap['error']) => void;
  onClose?: (event: WebSocketEventMap['close']) => void;
}
```

#### Return Value

```typescript
interface UseWebSocketReturn {
  // WebSocket
  ws: WebSocket | null;

  // State
  state: ConnectionState;
  isConnected: boolean;
  isConnecting: boolean;

  // Reconnection
  reconnectionAttempt: number;

  // Stats
  stats: {
    connections: number;
    reconnectionAttempts: number;
    messagesReceived: number;
    messagesSent: number;
    lastConnectedAt: number | null;
    lastDisconnectedAt: number | null;
    uptime: number;
  };

  // Actions
  send: (data: string | ArrayBuffer) => void;
  connect: () => void;
  disconnect: (code?: number, reason?: string) => void;
  resetReconnection: () => void;
}
```

---

## API Reference

### ConnectionState

```typescript
type ConnectionState =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'error';
```

### ConnectionStats

```typescript
interface ConnectionStats {
  connections: number;           // Total successful connections
  reconnectionAttempts: number;  // Total reconnection attempts
  messagesReceived: number;      // Total messages received
  messagesSent: number;          // Total messages sent
  lastConnectedAt: number | null; // Timestamp of last connection
  lastDisconnectedAt: number | null; // Timestamp of last disconnect
  uptime: number;                // Current session uptime in ms
}
```

### ReconnectionOptions

```typescript
interface ReconnectionOptions {
  enabled?: boolean;             // Enable auto-reconnect
  maxAttempts?: number;          // -1 = infinite
  initialDelay?: number;         // Starting delay in ms
  maxDelay?: number;             // Maximum delay in ms
  backoffMultiplier?: number;    // Delay multiplier
  jitter?: boolean;              // Add randomness
}
```

---

## Usage Examples

### Basic Usage

```typescript
import { useWebSocket, WebSocketStatus } from '@ws-fabric/status-indicator';

function Chat() {
  const { state, send, isConnected } = useWebSocket({
    url: 'ws://localhost:8080',
    immediate: true,
  });

  const handleMessage = (event: MessageEvent) => {
    console.log('Received:', event.data);
  };

  return (
    <div>
      <WebSocketStatus state={state} />

      {isConnected && (
        <input
          type="text"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              send(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
        />
      )}
    </div>
  );
}
```

### With Custom Styling

```typescript
<WebSocketStatus
  state={state}
  useDot
  colors={{
    connected: '#00ff88',
    disconnected: '#ff4444',
    reconnecting: '#ffaa00',
  }}
  labels={{
    connected: 'Online',
    disconnected: 'Offline',
    reconnecting: 'Reconnecting...'
  }}
  size={0.8}
/>
```

### With Reconnection Display

```typescript
function StatusWithReconnect() {
  const { state, reconnectionAttempt } = useWebSocket({
    url: 'ws://localhost:8080',
    reconnection: {
      enabled: true,
      maxAttempts: 10,
      initialDelay: 2000,
    }
  });

  return (
    <WebSocketStatus
      state={state}
      reconnectionAttempt={reconnectionAttempt}
      showAttempt={state === 'reconnecting'}
      labels={{
        reconnecting: `Reconnecting (${reconnectionAttempt}/10)...`
      }}
    />
  );
}
```

### Size Variants

```typescript
// Small
<WebSocketStatus state={state} size={0.5} />

// Default
<WebSocketStatus state={state} size={1} />

// Large
<WebSocketStatus state={state} size={1.5} />

// Extra Large
<WebSocketStatus state={state} size={2} />
```

### Layout Variants

```typescript
// Horizontal (default)
<WebSocketStatus state={state} layout="horizontal" />

// Vertical
<WebSocketStatus state={state} layout="vertical" />
```

### Minimal/Compact

```typescript
// Icon only
<WebSocketStatus state={state} hideText />

// Dot only
<WebSocketStatus state={state} hideText useDot />

// Text only
<WebSocketStatus state={state} hideIcon />
```

### Provider Pattern

```typescript
import {
  WebSocketProvider,
  WebSocketStatusAuto
} from '@ws-fabric/status-indicator';

function App() {
  return (
    <WebSocketProvider
      options={{
        url: 'ws://localhost:8080',
        immediate: true,
        reconnection: { enabled: true }
      }}
    >
      <Header />
      <Content />
    </WebSocketProvider>
  );
}

function Header() {
  // State automatically from context
  return (
    <header>
      <WebSocketStatusAuto />
    </header>
  );
}

function Content() {
  const { send, isConnected } = useWebSocket();

  return (
    <main>
      {isConnected ? <Chat /> : <Disconnected />}
    </main>
  );
}
```

### Event Handling

```typescript
function ChatWithEvents() {
  const { state, send } = useWebSocket({
    url: 'ws://localhost:8080',
    onOpen: (event) => {
      console.log('Connected!');
    },
    onMessage: (event) => {
      console.log('Message:', event.data);
    },
    onError: (event) => {
      console.error('WebSocket error:', event);
    },
    onClose: (event) => {
      console.log('Disconnected:', event.code, event.reason);
    },
  });

  return <WebSocketStatus state={state} />;
}
```

---

## Styling

### CSS Classes

The component uses predictable class names:

```css
.ws-status {              /* Container */
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.ws-status-dot {          /* Status dot */
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.ws-status-icon {         /* SVG icon */
  width: 1em;
  height: 1em;
}

.ws-status-text {         /* Text label */
  font-size: 0.875rem;
  font-weight: 500;
}
```

### Custom Styles

```typescript
<WebSocketStatus
  state={state}
  className="my-custom-status"
/>

// In your CSS
.my-custom-status {
  background: #1a1a1a;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
}

.my-custom-status .ws-status-text {
  color: white;
  font-family: 'Inter', sans-serif;
}
```

### State-Specific Styles

```css
/* Connected */
.ws-status--connected .ws-status-dot {
  background-color: #10b981;
}

/* Connecting */
.ws-status--connecting .ws-status-dot {
  background-color: #f59e0b;
}

/* Disconnected */
.ws-status--disconnected .ws-status-dot {
  background-color: #ef4444;
}

/* Error */
.ws-status--error .ws-status-dot {
  background-color: #dc2626;
}
```

---

## Advanced Topics

### Custom Reconnection Strategy

```typescript
const { state, resetReconnection } = useWebSocket({
  url: 'ws://localhost:8080',
  reconnection: {
    enabled: true,
    maxAttempts: 5,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true,
  }
});

// Manual reset
resetReconnection();
```

### Reconnection Timing

The default reconnection uses exponential backoff:

```
Attempt 1: 1000ms   (1 second)
Attempt 2: 2000ms   (2 seconds)
Attempt 3: 4000ms   (4 seconds)
Attempt 4: 8000ms   (8 seconds)
Attempt 5: 16000ms  (16 seconds)
...with 25% jitter (randomness)
```

### Multiple Connections

```typescript
function App() {
  const primary = useWebSocket({ url: 'ws://localhost:8000' });
  const secondary = useWebSocket({ url: 'ws://localhost:8001' });

  return (
    <>
      <WebSocketStatus state={primary.state} />
      <WebSocketStatus state={secondary.state} />
    </>
  );
}
```

### TypeScript Types

All types are exported:

```typescript
import type {
  ConnectionState,
  ConnectionStats,
  ReconnectionOptions,
  WebSocketOptions,
  UseWebSocketReturn,
  WebSocketStatusProps,
} from '@ws-fabric/status-indicator';
```

---

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Bundle Size

| Component | Minified | Gzipped |
|-----------|----------|---------|
| Core | 4.2 KB | 1.8 KB |
| With Icons | 5.1 KB | 2.2 KB |
| With Styles | 6.3 KB | 2.7 KB |

---

## Testing

```typescript
import { renderHook } from '@testing-library/react';
import { useWebSocket } from '@ws-fabric/status-indicator';

test('should connect to WebSocket', () => {
  const { result } = renderHook(() =>
    useWebSocket({ url: 'ws://localhost:8080' })
  );

  expect(result.current.state).toBe('connecting');

  // Simulate connection
  act(() => {
    result.current.connect();
  });
});
```

---

**Package Version:** 1.0.0
**Documentation Version:** 1.0.0
**Last Updated:** 2025-01-10
