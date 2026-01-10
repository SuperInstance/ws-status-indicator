import React, { useState, useEffect, useRef } from 'react';
import {
  WebSocketStatus,
  WebSocketProvider,
  WebSocketStatusAuto,
  WebSocketStatusConnected,
  WebSocketStatusDisconnected,
  useWebSocket,
} from '@ws-fabric/status-indicator';
import './App.css';

/**
 * Example 1: Controlled WebSocketStatus component
 * Demonstrates manual state management
 */
function ControlledStatusExample() {
  const [state, setState] = useState<ConnectionState>('disconnected');
  const [attempt, setAttempt] = useState(0);

  const simulateConnection = () => {
    setState('connecting');
    setTimeout(() => setState('connected'), 1500);
  };

  const simulateDisconnection = () => {
    setState('disconnected');
  };

  const simulateReconnection = () => {
    setState('reconnecting');
    setAttempt(1);

    const interval = setInterval(() => {
      setAttempt((prev) => {
        if (prev >= 5) {
          clearInterval(interval);
          setState('connected');
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  return (
    <div className="example-card">
      <h3>1. Controlled Component</h3>
      <p className="hint">Manually control the connection state:</p>

      <div className="status-display">
        <WebSocketStatus
          state={state}
          reconnectionAttempt={attempt}
          showAttempt
        />
      </div>

      <div className="button-group">
        <button onClick={simulateConnection} className="btn btn-success">
          Connect
        </button>
        <button onClick={simulateDisconnection} className="btn btn-danger">
          Disconnect
        </button>
        <button onClick={simulateReconnection} className="btn btn-warning">
          Simulate Reconnect
        </button>
      </div>

      <pre className="state-display">
        State: {state} {attempt > 0 && `(attempt ${attempt})`}
      </pre>
    </div>
  );
}

/**
 * Example 2: Using useWebSocket hook with real WebSocket
 * Demonstrates actual connection management
 */
function HookExample() {
  const [messages, setMessages] = useState<string[]>([]);

  const {
    state,
    isConnected,
    isConnecting,
    reconnectionAttempt,
    stats,
    send,
    connect,
    disconnect,
  } = useWebSocket({
    url: 'wss://echo.websocket.org', // Public echo server
    immediate: false, // Don't connect immediately
    reconnection: {
      enabled: true,
      maxAttempts: 5,
      initialDelay: 1000,
      maxDelay: 5000,
    },
    onMessage: (event) => {
      setMessages((prev) => [`Received: ${event.data.slice(0, 50)}...`, ...prev].slice(0, 10));
    },
  });

  const sendMessage = () => {
    send(`Hello at ${new Date().toLocaleTimeString()}`);
    setMessages((prev) => [`Sent: Hello at ${new Date().toLocaleTimeString()}`, ...prev].slice(0, 10));
  };

  return (
    <div className="example-card">
      <h3>2. Real WebSocket (wss://echo.websocket.org)</h3>
      <p className="hint">Connects to a public echo server:</p>

      <div className="status-display">
        <WebSocketStatus
          state={state}
          reconnectionAttempt={reconnectionAttempt}
          showAttempt
        />
      </div>

      <div className="button-group">
        {!isConnected ? (
          <button onClick={connect} className="btn btn-success" disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        ) : (
          <>
            <button onClick={sendMessage} className="btn btn-primary">
              Send Message
            </button>
            <button onClick={disconnect} className="btn btn-danger">
              Disconnect
            </button>
          </>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Connections:</span>
          <span className="stat-value">{stats.connections}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Messages Sent:</span>
          <span className="stat-value">{stats.messagesSent}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Messages Received:</span>
          <span className="stat-value">{stats.messagesReceived}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Uptime:</span>
          <span className="stat-value">{(stats.uptime / 1000).toFixed(1)}s</span>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="messages-log">
          <h4>Message Log:</h4>
          {messages.map((msg, i) => (
            <div key={i} className="message-item">
              {msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example 3: WebSocketProvider with context
 * Demonstrates using the provider pattern
 */
function ProviderExample() {
  return (
    <WebSocketProvider
      options={{
        url: 'wss://echo.websocket.org',
        immediate: false,
      }}
    >
      <ProviderInner />
    </WebSocketProvider>
  );
}

function ProviderInner() {
  const { isConnected, connect, disconnect } = useWebSocket();

  return (
    <div className="example-card">
      <h3>3. WebSocketProvider Pattern</h3>
      <p className="hint">Using context to share WebSocket state:</p>

      <div className="status-display">
        <WebSocketStatusAuto showAttempt />
      </div>

      <div className="button-group">
        <button onClick={connect} className="btn btn-success" disabled={isConnected}>
          Connect
        </button>
        <button onClick={disconnect} className="btn btn-danger" disabled={!isConnected}>
          Disconnect
        </button>
      </div>

      <WebSocketStatusConnected fallback={<p className="hint">Status: Not connected</p>}>
        <p className="success-text">You are connected! Content only shown when connected.</p>
      </WebSocketStatusConnected>

      <WebSocketStatusDisconnected>
        <p className="error-text">You are disconnected. Click Connect above.</p>
      </WebSocketStatusDisconnected>
    </div>
  );
}

/**
 * Example 4: Custom styling
 * Demonstrates customization options
 */
function CustomStyleExample() {
  return (
    <div className="example-card">
      <h3>4. Custom Styling</h3>
      <p className="hint">Various style configurations:</p>

      <div className="style-grid">
        <div className="style-item">
          <label>Default</label>
          <WebSocketStatus state="connected" />
        </div>
        <div className="style-item">
          <label>Dot Style</label>
          <WebSocketStatus state="connected" useDot />
        </div>
        <div className="style-item">
          <label>Icon Only</label>
          <WebSocketStatus state="connected" hideText />
        </div>
        <div className="style-item">
          <label>Text Only</label>
          <WebSocketStatus state="connected" hideIcon />
        </div>
        <div className="style-item">
          <label>Custom Labels</label>
          <WebSocketStatus
            state="connected"
            labels={{ connected: 'Online', disconnected: 'Offline' }}
          />
        </div>
        <div className="style-item">
          <label>Custom Colors</label>
          <WebSocketStatus
            state="connected"
            useDot
            colors={{ connected: '#8b5cf6', disconnected: '#f43f5e' }}
          />
        </div>
        <div className="style-item">
          <label>Large Size</label>
          <WebSocketStatus state="connected" size={1.5} />
        </div>
        <div className="style-item">
          <label>Vertical Layout</label>
          <WebSocketStatus state="connected" layout="vertical" />
        </div>
      </div>

      <div className="style-row">
        <label>All States:</label>
        <div className="all-states">
          <WebSocketStatus state="connected" useDot />
          <WebSocketStatus state="connecting" useDot />
          <WebSocketStatus state="disconnected" useDot />
          <WebSocketStatus state="reconnecting" useDot />
          <WebSocketStatus state="error" useDot />
        </div>
      </div>
    </div>
  );
}

/**
 * Example 5: Compact UI pattern
 * Demonstrates minimal status indicator for header/navigation
 */
function CompactExample() {
  const { state, connect, disconnect } = useWebSocket({
    url: 'wss://echo.websocket.org',
    immediate: false,
  });

  return (
    <div className="example-card">
      <h3>5. Compact Header Pattern</h3>
      <p className="hint">Minimal status for app header:</p>

      <div className="header-bar">
        <span>MyApp</span>
        <WebSocketStatus state={state} hideText useDot size={0.75} />
      </div>

      <div className="button-group">
        <button onClick={connect} className="btn btn-sm btn-success">Connect</button>
        <button onClick={disconnect} className="btn btn-sm btn-danger">Disconnect</button>
      </div>
    </div>
  );
}

/**
 * Main App Component
 */
function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>WebSocket Status Indicator</h1>
        <p>React component examples</p>
      </header>

      <main className="app-main">
        <ControlledStatusExample />
        <HookExample />
        <ProviderExample />
        <CustomStyleExample />
        <CompactExample />
      </main>

      <footer className="app-footer">
        <p>
          Documentation:{' '}
          <a href="https://github.com/ws-fabric/status-indicator">
            github.com/ws-fabric/status-indicator
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;

// Import types
import type { ConnectionState };
