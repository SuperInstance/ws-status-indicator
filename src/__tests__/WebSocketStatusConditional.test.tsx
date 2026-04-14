import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import {
  WebSocketProvider,
  WebSocketStatusConnected,
  WebSocketStatusDisconnected,
  WebSocketStatusAuto,
  useWebSocketContext,
} from '../components/WebSocketStatus';

function createFakeWebSocket() {
  const instance: any = {
    url: '',
    readyState: 0,
    onopen: null,
    onclose: null,
    onerror: null,
    onmessage: null,
    close: vi.fn(),
    send: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    _simulate(event: string, data?: any) {
      switch (event) {
        case 'open':
          instance.readyState = 1;
          instance.onopen?.({ type: 'open' });
          break;
        case 'message':
          instance.onmessage?.({ type: 'message', data });
          break;
        case 'error':
          instance.onerror?.({ type: 'error' });
          break;
        case 'close':
          instance.readyState = 3;
          instance.onclose?.({ type: 'close', wasClean: data?.wasClean ?? false, code: data?.code ?? 1006, reason: data?.reason ?? '' });
          break;
      }
    },
  };
  return instance;
}

describe('WebSocketProvider', () => {
  it('provides WebSocket context to children', () => {
    const WebSocketClass = vi.fn(() => {
      const ws = createFakeWebSocket();
      ws.readyState = 0;
      return ws;
    });

    const TestChild = () => {
      const ctx = useWebSocketContext();
      return <div data-testid="child">{ctx.state}</div>;
    };

    render(
      <WebSocketProvider options={{ url: 'ws://localhost', immediate: true, WebSocketClass }}>
        <TestChild />
      </WebSocketProvider>
    );

    expect(screen.getByTestId('child').textContent).toBe('connecting');
  });

  it('useWebSocketContext throws when used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const TestComponent = () => {
      useWebSocketContext();
      return null;
    };

    expect(() => render(<TestComponent />)).toThrow(
      'useWebSocketContext must be used within WebSocketProvider'
    );

    spy.mockRestore();
  });
});

describe('WebSocketStatusConnected', () => {
  it('renders children when connected', () => {
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    const { container } = render(
      <WebSocketProvider options={{ url: 'ws://localhost', immediate: true, WebSocketClass, reconnection: { enabled: false, maxAttempts: -1, initialDelay: 1000, maxDelay: 30000, backoffMultiplier: 2, jitter: false } }}>
        <WebSocketStatusConnected>
          <span data-testid="connected-content">Online</span>
        </WebSocketStatusConnected>
      </WebSocketProvider>
    );

    act(() => {
      fakeWs!._simulate('open');
    });

    expect(screen.getByTestId('connected-content')).toBeInTheDocument();
  });

  it('renders fallback when not connected', () => {
    const WebSocketClass = vi.fn(() => {
      const ws = createFakeWebSocket();
      ws.readyState = 3;
      return ws;
    });

    render(
      <WebSocketProvider options={{ url: 'ws://localhost', immediate: false, WebSocketClass }}>
        <WebSocketStatusConnected fallback={<span data-testid="fallback">Offline</span>}>
          <span data-testid="connected-content">Online</span>
        </WebSocketStatusConnected>
      </WebSocketProvider>
    );

    expect(screen.queryByTestId('connected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
  });
});

describe('WebSocketStatusDisconnected', () => {
  it('renders children when disconnected', () => {
    const WebSocketClass = vi.fn(() => {
      const ws = createFakeWebSocket();
      ws.readyState = 3;
      return ws;
    });

    render(
      <WebSocketProvider options={{ url: 'ws://localhost', immediate: false, WebSocketClass }}>
        <WebSocketStatusDisconnected>
          <span data-testid="disconnected-content">Offline</span>
        </WebSocketStatusDisconnected>
      </WebSocketProvider>
    );

    expect(screen.getByTestId('disconnected-content')).toBeInTheDocument();
  });

  it('renders fallback when connected', () => {
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    const { container } = render(
      <WebSocketProvider options={{ url: 'ws://localhost', immediate: true, WebSocketClass, reconnection: { enabled: false, maxAttempts: -1, initialDelay: 1000, maxDelay: 30000, backoffMultiplier: 2, jitter: false } }}>
        <WebSocketStatusDisconnected fallback={<span data-testid="fallback-connected">Active</span>}>
          <span data-testid="disconnected-content">Offline</span>
        </WebSocketStatusDisconnected>
      </WebSocketProvider>
    );

    act(() => {
      fakeWs!._simulate('open');
    });

    expect(screen.queryByTestId('disconnected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('fallback-connected')).toBeInTheDocument();
  });
});

describe('WebSocketStatusAuto', () => {
  it('renders status indicator from context', () => {
    const WebSocketClass = vi.fn(() => {
      const ws = createFakeWebSocket();
      ws.readyState = 3;
      return ws;
    });

    render(
      <WebSocketProvider options={{ url: 'ws://localhost', immediate: false, WebSocketClass }}>
        <WebSocketStatusAuto />
      </WebSocketProvider>
    );

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('accepts props like useDot', () => {
    const WebSocketClass = vi.fn(() => {
      const ws = createFakeWebSocket();
      ws.readyState = 3;
      return ws;
    });

    const { container } = render(
      <WebSocketProvider options={{ url: 'ws://localhost', immediate: false, WebSocketClass }}>
        <WebSocketStatusAuto useDot />
      </WebSocketProvider>
    );

    expect(container.querySelector('.ws-status-dot')).toBeInTheDocument();
  });
});
