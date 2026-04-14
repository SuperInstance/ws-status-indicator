import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusText } from '../components/StatusText';
import type { ConnectionState } from '../types';

describe('StatusText', () => {
  it('renders default label for connected state', () => {
    render(<StatusText state="connected" />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('renders default label for connecting state', () => {
    render(<StatusText state="connecting" />);
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('renders default label for disconnected state', () => {
    render(<StatusText state="disconnected" />);
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('renders default label for reconnecting state', () => {
    render(<StatusText state="reconnecting" />);
    expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
  });

  it('renders default label for error state', () => {
    render(<StatusText state="error" />);
    expect(screen.getByText('Connection Error')).toBeInTheDocument();
  });

  it('renders custom labels', () => {
    render(
      <StatusText
        state="connected"
        labels={{ connected: 'Online', disconnected: 'Offline' }}
      />
    );
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('falls back to default label when custom label is not provided for that state', () => {
    render(
      <StatusText
        state="disconnected"
        labels={{ connected: 'Online' }}
      />
    );
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('shows reconnection attempt number when showAttempt=true and reconnecting', () => {
    render(
      <StatusText
        state="reconnecting"
        showAttempt={true}
        reconnectionAttempt={3}
      />
    );
    expect(screen.getByText('Reconnecting... (3)')).toBeInTheDocument();
  });

  it('does not show attempt number for non-reconnecting states', () => {
    render(
      <StatusText
        state="connected"
        showAttempt={true}
        reconnectionAttempt={3}
      />
    );
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('does not show attempt number when showAttempt=false', () => {
    render(
      <StatusText
        state="reconnecting"
        showAttempt={false}
        reconnectionAttempt={3}
      />
    );
    expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
  });

  it('does not append attempt when reconnectionAttempt is 0', () => {
    render(
      <StatusText
        state="reconnecting"
        showAttempt={true}
        reconnectionAttempt={0}
      />
    );
    expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
  });

  it('applies additional className', () => {
    const { container } = render(<StatusText state="connected" className="custom-text" />);
    const span = container.querySelector('span')!;
    expect(span.className).toContain('custom-text');
  });

  it('renders for all connection states', () => {
    const states: ConnectionState[] = ['connecting', 'connected', 'disconnected', 'reconnecting', 'error'];
    states.forEach((state) => {
      const { container } = render(<StatusText state={state} />);
      expect(container.querySelector('span')).toBeInTheDocument();
    });
  });
});
