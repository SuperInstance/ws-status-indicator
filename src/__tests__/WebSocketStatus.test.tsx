import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WebSocketStatus } from '../components/WebSocketStatus';
import type { ConnectionState } from '../types';

describe('WebSocketStatus', () => {
  it('renders with role="status"', () => {
    render(<WebSocketStatus state="connected" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders with aria-live="polite"', () => {
    render(<WebSocketStatus state="connected" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('renders the status text by default', () => {
    render(<WebSocketStatus state="connected" />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('renders an icon by default', () => {
    const { container } = render(<WebSocketStatus state="connected" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('hides text when hideText=true', () => {
    render(<WebSocketStatus state="connected" hideText />);
    expect(screen.queryByText('Connected')).not.toBeInTheDocument();
  });

  it('hides icon when hideIcon=true', () => {
    const { container } = render(<WebSocketStatus state="connected" hideIcon />);
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('renders dot instead of icon when useDot=true', () => {
    const { container } = render(<WebSocketStatus state="connected" useDot />);
    expect(container.querySelector('svg')).not.toBeInTheDocument();
    expect(container.querySelector('span.ws-status-dot')).toBeInTheDocument();
  });

  it('applies horizontal layout by default', () => {
    const { container } = render(<WebSocketStatus state="connected" />);
    const wrapper = container.querySelector('.ws-status')!;
    expect(wrapper.className).toContain('flex-row');
  });

  it('applies vertical layout when layout="vertical"', () => {
    const { container } = render(<WebSocketStatus state="connected" layout="vertical" />);
    const wrapper = container.querySelector('.ws-status')!;
    expect(wrapper.className).toContain('flex-col');
  });

  it('renders with custom labels', () => {
    render(<WebSocketStatus state="connected" labels={{ connected: 'Online' }} />);
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('shows reconnection attempt in text', () => {
    render(
      <WebSocketStatus state="reconnecting" showAttempt reconnectionAttempt={2} />
    );
    expect(screen.getByText('Reconnecting... (2)')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<WebSocketStatus state="connected" className="my-status" />);
    const wrapper = container.querySelector('.ws-status')!;
    expect(wrapper.className).toContain('my-status');
  });

  it('renders children', () => {
    render(
      <WebSocketStatus state="connected">
        <span data-testid="child">Child</span>
      </WebSocketStatus>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders all connection states without error', () => {
    const states: ConnectionState[] = ['connecting', 'connected', 'disconnected', 'reconnecting', 'error'];
    states.forEach((state) => {
      const { unmount } = render(<WebSocketStatus state={state} />);
      unmount();
    });
  });

  it('uses custom colors with useDot (normalized to rgb by browser)', () => {
    const { container } = render(
      <WebSocketStatus state="connected" useDot colors={{ connected: '#00ff00' }} />
    );
    const dot = container.querySelector('.ws-status-dot') as HTMLElement;
    expect(dot.style.backgroundColor).toBe('rgb(0, 255, 0)');
  });

  it('applies default size class for size=1', () => {
    const { container } = render(<WebSocketStatus state="connected" size={1} />);
    const wrapper = container.querySelector('.ws-status')!;
    expect(wrapper.className).toContain('text-sm');
    expect(wrapper.className).toContain('gap-2');
  });

  it('applies small size class for size=0.5', () => {
    const { container } = render(<WebSocketStatus state="connected" size={0.5} />);
    const wrapper = container.querySelector('.ws-status')!;
    expect(wrapper.className).toContain('text-xs');
  });

  it('applies large size class for size=2', () => {
    const { container } = render(<WebSocketStatus state="connected" size={2} />);
    const wrapper = container.querySelector('.ws-status')!;
    expect(wrapper.className).toContain('text-xl');
  });

  it('applies inline-flex class', () => {
    const { container } = render(<WebSocketStatus state="connected" />);
    const wrapper = container.querySelector('.ws-status')!;
    expect(wrapper.className).toContain('inline-flex');
  });
});
