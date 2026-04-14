import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWebSocket } from '../hooks/useWebSocket';

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

describe('useWebSocket', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('starts in connecting state when immediate=true', () => {
    const WebSocketClass = vi.fn(() => {
      const ws = createFakeWebSocket();
      ws.readyState = 0;
      return ws;
    });

    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: true, WebSocketClass })
    );

    expect(result.current.state).toBe('connecting');
    expect(WebSocketClass).toHaveBeenCalledTimes(1);
    expect(WebSocketClass).toHaveBeenCalledWith('ws://localhost', undefined);
  });

  it('starts in disconnected state when immediate=false', () => {
    const WebSocketClass = vi.fn(() => createFakeWebSocket());

    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: false, WebSocketClass })
    );

    expect(result.current.state).toBe('disconnected');
    expect(WebSocketClass).not.toHaveBeenCalled();
  });

  it('transitions to connected on open event', () => {
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: true, WebSocketClass })
    );

    act(() => {
      fakeWs!._simulate('open');
    });

    expect(result.current.state).toBe('connected');
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isConnecting).toBe(false);
  });

  it('increments connections stat on open', () => {
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: true, WebSocketClass })
    );

    act(() => {
      fakeWs!._simulate('open');
    });

    expect(result.current.stats.connections).toBe(1);
    expect(result.current.stats.lastConnectedAt).not.toBeNull();
  });

  it('transitions to error on error event', () => {
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: true, WebSocketClass })
    );

    act(() => {
      fakeWs!._simulate('error');
    });

    expect(result.current.state).toBe('error');
  });

  it('calls onError callback', () => {
    const onError = vi.fn();
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: true, WebSocketClass, onError })
    );

    act(() => {
      fakeWs!._simulate('error');
    });

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('transitions to disconnected on clean close', () => {
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: true, WebSocketClass })
    );

    act(() => {
      fakeWs!._simulate('open');
    });

    act(() => {
      fakeWs!._simulate('close', { wasClean: true, code: 1000 });
    });

    expect(result.current.state).toBe('disconnected');
  });

  it('schedules reconnection on unclean close', () => {
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    const { result } = renderHook(() =>
      useWebSocket({
        url: 'ws://localhost',
        immediate: true,
        WebSocketClass,
        reconnection: { enabled: true, maxAttempts: 3, initialDelay: 1000, maxDelay: 30000, backoffMultiplier: 2, jitter: false },
      })
    );

    act(() => {
      fakeWs!._simulate('open');
    });

    act(() => {
      fakeWs!._simulate('close', { wasClean: false });
    });

    expect(result.current.state).toBe('reconnecting');
    expect(result.current.stats.reconnectionAttempts).toBe(1);
  });

  it('does not reconnect when reconnection is disabled', () => {
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    const { result } = renderHook(() =>
      useWebSocket({
        url: 'ws://localhost',
        immediate: true,
        WebSocketClass,
        reconnection: { enabled: false, maxAttempts: -1, initialDelay: 1000, maxDelay: 30000, backoffMultiplier: 2, jitter: false },
      })
    );

    act(() => {
      fakeWs!._simulate('open');
    });

    act(() => {
      fakeWs!._simulate('close', { wasClean: false });
    });

    expect(result.current.state).toBe('disconnected');
  });

  it('stops reconnecting when maxAttempts is 0', () => {
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    const { result } = renderHook(() =>
      useWebSocket({
        url: 'ws://localhost',
        immediate: true,
        WebSocketClass,
        reconnection: { enabled: true, maxAttempts: 0, initialDelay: 100, maxDelay: 500, backoffMultiplier: 1, jitter: false },
      })
    );

    act(() => {
      fakeWs!._simulate('open');
    });

    act(() => {
      fakeWs!._simulate('close', { wasClean: false });
    });

    // With maxAttempts=0, reconnectionAttempt (0) >= maxAttempts (0) → disconnected
    expect(result.current.state).toBe('disconnected');
  });

  it('send() calls ws.send when connected', () => {
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: true, WebSocketClass })
    );

    act(() => {
      fakeWs!._simulate('open');
    });

    act(() => {
      result.current.send('hello');
    });

    expect(fakeWs!.send).toHaveBeenCalledWith('hello');
    expect(result.current.stats.messagesSent).toBe(1);
  });

  it('send() does not send when not connected', () => {
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 3;
      return fakeWs;
    });

    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: true, WebSocketClass })
    );

    act(() => {
      result.current.send('hello');
    });

    expect(fakeWs!.send).not.toHaveBeenCalled();
  });

  it('increments messagesReceived on message event', () => {
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: true, WebSocketClass })
    );

    act(() => {
      fakeWs!._simulate('open');
    });

    act(() => {
      fakeWs!._simulate('message', 'test data');
    });

    expect(result.current.stats.messagesReceived).toBe(1);
  });

  it('calls onMessage callback', () => {
    const onMessage = vi.fn();
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: true, WebSocketClass, onMessage })
    );

    act(() => {
      fakeWs!._simulate('open');
    });

    act(() => {
      fakeWs!._simulate('message', 'hello');
    });

    expect(onMessage).toHaveBeenCalledTimes(1);
  });

  it('calls onOpen callback', () => {
    const onOpen = vi.fn();
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: true, WebSocketClass, onOpen })
    );

    act(() => {
      fakeWs!._simulate('open');
    });

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('calls onClose callback', () => {
    const onClose = vi.fn();
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: true, WebSocketClass, onClose })
    );

    act(() => {
      fakeWs!._simulate('close', { wasClean: true, code: 1000 });
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disconnect() calls ws.close with code and reason', () => {
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: true, WebSocketClass })
    );

    act(() => {
      fakeWs!._simulate('open');
    });

    expect(result.current.state).toBe('connected');

    act(() => {
      result.current.disconnect(1000, 'bye');
    });

    expect(fakeWs!.close).toHaveBeenCalledWith(1000, 'bye');
  });

  it('connect() can be called manually when immediate=false', () => {
    const WebSocketClass = vi.fn(() => {
      const ws = createFakeWebSocket();
      ws.readyState = 0;
      return ws;
    });

    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: false, WebSocketClass })
    );

    expect(WebSocketClass).not.toHaveBeenCalled();

    act(() => {
      result.current.connect();
    });

    expect(WebSocketClass).toHaveBeenCalledTimes(1);
  });

  it('resetReconnection() resets attempt counter', () => {
    const WebSocketClass = vi.fn(() => {
      const ws = createFakeWebSocket();
      ws.readyState = 0;
      return ws;
    });

    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: false, WebSocketClass })
    );

    act(() => {
      result.current.resetReconnection();
    });

    expect(result.current.reconnectionAttempt).toBe(0);
  });

  it('isConnecting is true for connecting state', () => {
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: true, WebSocketClass })
    );

    expect(result.current.isConnecting).toBe(true);
  });

  it('isConnecting is false for connected state', () => {
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: true, WebSocketClass })
    );

    act(() => {
      fakeWs!._simulate('open');
    });

    expect(result.current.isConnecting).toBe(false);
  });

  it('isConnecting is true for reconnecting state', () => {
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    const { result } = renderHook(() =>
      useWebSocket({
        url: 'ws://localhost',
        immediate: true,
        WebSocketClass,
        reconnection: { enabled: true, maxAttempts: 3, initialDelay: 1000, maxDelay: 30000, backoffMultiplier: 2, jitter: false },
      })
    );

    act(() => {
      fakeWs!._simulate('open');
    });

    act(() => {
      fakeWs!._simulate('close', { wasClean: false });
    });

    expect(result.current.isConnecting).toBe(true);
  });

  it('uses protocols parameter', () => {
    const WebSocketClass = vi.fn(() => {
      const ws = createFakeWebSocket();
      ws.readyState = 0;
      return ws;
    });

    renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: true, WebSocketClass, protocols: ['graphql-ws'] })
    );

    expect(WebSocketClass).toHaveBeenCalledWith('ws://localhost', ['graphql-ws']);
  });

  it('uses string protocol parameter', () => {
    const WebSocketClass = vi.fn(() => {
      const ws = createFakeWebSocket();
      ws.readyState = 0;
      return ws;
    });

    renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: true, WebSocketClass, protocols: 'ws' })
    );

    expect(WebSocketClass).toHaveBeenCalledWith('ws://localhost', 'ws');
  });

  it('cleanup on unmount closes WebSocket', () => {
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    const { unmount } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: true, WebSocketClass })
    );

    act(() => {
      fakeWs!._simulate('open');
    });

    unmount();

    expect(fakeWs!.close).toHaveBeenCalled();
  });

  it('reconnection resets attempt counter on successful reconnect', () => {
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    const { result } = renderHook(() =>
      useWebSocket({
        url: 'ws://localhost',
        immediate: true,
        WebSocketClass,
        reconnection: { enabled: true, maxAttempts: 5, initialDelay: 100, maxDelay: 500, backoffMultiplier: 1, jitter: false },
      })
    );

    act(() => {
      fakeWs!._simulate('open');
    });
    expect(result.current.reconnectionAttempt).toBe(0);

    act(() => {
      fakeWs!._simulate('close', { wasClean: false });
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      fakeWs!._simulate('open');
    });
    expect(result.current.reconnectionAttempt).toBe(0);
  });

  it('calls onConnecting callback when connecting', () => {
    const onConnecting = vi.fn();
    const WebSocketClass = vi.fn(() => {
      const ws = createFakeWebSocket();
      ws.readyState = 0;
      return ws;
    });

    renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: true, WebSocketClass, onConnecting })
    );

    expect(onConnecting).toHaveBeenCalledTimes(1);
  });

  it('calls onReconnecting callback when reconnecting', () => {
    const onReconnecting = vi.fn();
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    renderHook(() =>
      useWebSocket({
        url: 'ws://localhost',
        immediate: true,
        WebSocketClass,
        onReconnecting,
        reconnection: { enabled: true, maxAttempts: 3, initialDelay: 1000, maxDelay: 30000, backoffMultiplier: 2, jitter: false },
      })
    );

    act(() => {
      fakeWs!._simulate('open');
    });

    act(() => {
      fakeWs!._simulate('close', { wasClean: false });
    });

    expect(onReconnecting).toHaveBeenCalledWith(1);
  });

  it('returns correct initial stats', () => {
    const WebSocketClass = vi.fn(() => {
      const ws = createFakeWebSocket();
      ws.readyState = 3;
      return ws;
    });

    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: false, WebSocketClass })
    );

    expect(result.current.stats.connections).toBe(0);
    expect(result.current.stats.reconnectionAttempts).toBe(0);
    expect(result.current.stats.messagesReceived).toBe(0);
    expect(result.current.stats.messagesSent).toBe(0);
    expect(result.current.stats.lastConnectedAt).toBeNull();
    expect(result.current.stats.lastDisconnectedAt).toBeNull();
  });

  it('sets lastDisconnectedAt on close', () => {
    let fakeWs: any;
    const WebSocketClass = vi.fn(() => {
      fakeWs = createFakeWebSocket();
      fakeWs.readyState = 0;
      return fakeWs;
    });

    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost', immediate: true, WebSocketClass })
    );

    act(() => {
      fakeWs!._simulate('open');
    });

    act(() => {
      fakeWs!._simulate('close', { wasClean: true, code: 1000 });
    });

    expect(result.current.stats.lastDisconnectedAt).not.toBeNull();
  });
});
