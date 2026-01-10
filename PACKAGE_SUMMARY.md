# WebSocket Status Indicator - Package Summary

## Package Structure

```
ws-status-indicator/
├── src/
│   ├── components/
│   │   ├── StatusDot.tsx          # Simple colored dot indicator
│   │   ├── StatusIcon.tsx         # SVG icon component (WiFi, Loading, Error)
│   │   ├── StatusText.tsx         # Text label component
│   │   ├── WebSocketStatus.tsx    # Main component + Provider + conditional renderers
│   │   └── index.ts               # Component exports
│   ├── hooks/
│   │   ├── useWebSocket.ts        # Core WebSocket hook with reconnection
│   │   └── index.ts               # Hook exports
│   ├── utils/
│   │   └── cn.ts                  # Class name utility
│   ├── types.ts                   # All TypeScript types and interfaces
│   ├── constants.ts               # Default colors, labels, options
│   ├── styles.css                 # Base styles and animations
│   └── index.ts                   # Main package exports
├── stories/
│   └── WebSocketStatus.stories.tsx # Storybook documentation
├── examples/
│   ├── basic.html                 # Vanilla HTML/JS example
│   └── react/                     # React Vite example app
│       ├── App.tsx                # Example implementations
│       ├── App.css
│       ├── main.tsx
│       ├── index.html
│       ├── vite.config.ts
│       ├── package.json
│       └── tsconfig.json
├── .storybook/
│   ├── main.ts                    # Storybook config
│   └── preview.ts                 # Storybook preview
├── package.json                   # NPM package configuration
├── tsconfig.json                  # TypeScript config
├── tsup.config.ts                 # Build configuration
├── tailwind.config.js             # Tailwind CSS config
├── postcss.config.js              # PostCSS config
├── .gitignore
├── LICENSE                        # MIT License
└── README.md                      # Package documentation
```

## Component API

### Exports

```typescript
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
}

// Hooks
export {
  useWebSocket,
}

// Types
export type {
  ConnectionState,
  ConnectionStats,
  ReconnectionOptions,
  WebSocketOptions,
  UseWebSocketReturn,
  StatusDotProps,
  StatusIconProps,
  StatusTextProps,
  WebSocketStatusProps,
  WebSocketProviderProps,
  WebSocketStatusConnectedProps,
  WebSocketStatusDisconnectedProps,
  StatusLayout,
}

// Constants
export {
  DEFAULT_RECONNECTION_OPTIONS,
  DEFAULT_STATE_COLORS,
  DEFAULT_STATE_LABELS,
  STATE_ARIA_LABELS,
}
```

### `useWebSocket` Hook API

| Property | Type | Description |
|----------|------|-------------|
| `ws` | `WebSocket \| null` | Raw WebSocket instance |
| `state` | `ConnectionState` | Current connection state |
| `isConnected` | `boolean` | Connected convenience flag |
| `isConnecting` | `boolean` | Connecting/reconnecting flag |
| `reconnectionAttempt` | `number` | Current reconnection attempt |
| `stats` | `ConnectionStats` | Connection statistics |
| `send` | `(data) => void` | Send data through WebSocket |
| `connect` | `() => void` | Manually connect |
| `disconnect` | `(code?, reason?) => void` | Manually disconnect |
| `resetReconnection` | `() => void` | Reset reconnection counter |

### Connection States

- **`connecting`** - Initial connection attempt
- **`connected`** - Successfully connected
- **`disconnected`** - Disconnected (user or error)
- **`reconnecting`** - Auto-reconnecting
- **`error`** - Connection error occurred

### Reconnection Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable auto-reconnection |
| `maxAttempts` | `number` | `-1` | Max attempts (-1 = infinite) |
| `initialDelay` | `number` | `1000` | Initial delay in ms |
| `maxDelay` | `number` | `30000` | Maximum delay in ms |
| `backoffMultiplier` | `number` | `2` | Exponential backoff multiplier |
| `jitter` | `boolean` | `true` | Add randomization to delays |

## Installation & Usage

### Install

```bash
npm install @ws-fabric/status-indicator
```

### Basic Usage

```tsx
import { WebSocketStatus, useWebSocket } from '@ws-fabric/status-indicator';

function App() {
  const { state, connect, disconnect } = useWebSocket({
    url: 'wss://echo.websocket.org',
  });

  return (
    <>
      <WebSocketStatus state={state} />
      <button onClick={connect}>Connect</button>
    </>
  );
}
```

### Provider Pattern

```tsx
import { WebSocketProvider, WebSocketStatusAuto } from '@ws-fabric/status-indicator';

<WebSocketProvider options={{ url: 'ws://localhost:8080' }}>
  <WebSocketStatusAuto />
</WebSocketProvider>
```

## Development Commands

```bash
# Install dependencies
npm install

# Build package
npm run build

# Watch mode
npm run dev

# Run Storybook
npm run storybook

# Run React examples
cd examples/react
npm install
npm run dev
```

## Publishing

```bash
# Build the package
npm run build

# Publish to npm
npm publish
```

## Dependencies

### Peer Dependencies
- `react` ^18.0.0 || ^19.0.0
- `react-dom` ^18.0.0 || ^19.0.0

### Runtime Dependencies
- `@radix-ui/react-slot` ^1.1.1

### Dev Dependencies
- TypeScript
- tsup (bundling)
- Storybook (documentation)
- Vitest (testing)
- Tailwind CSS (styling)
