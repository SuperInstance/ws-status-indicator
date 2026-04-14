import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusDot } from '../components/StatusDot';
import type { ConnectionState } from '../types';

const allStates: ConnectionState[] = ['connecting', 'connected', 'disconnected', 'reconnecting', 'error'];

describe('StatusDot', () => {
  it('renders a span element', () => {
    const { container } = render(<StatusDot state="connected" />);
    expect(container.querySelector('span')).toBeInTheDocument();
  });

  it('has aria-hidden="true"', () => {
    const { container } = render(<StatusDot state="connected" />);
    expect(container.querySelector('span')).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies default size of 8px', () => {
    const { container } = render(<StatusDot state="connected" />);
    const dot = container.querySelector('span')!;
    expect(dot.style.width).toBe('8px');
    expect(dot.style.height).toBe('8px');
  });

  it('applies custom size', () => {
    const { container } = render(<StatusDot state="connected" size={16} />);
    const dot = container.querySelector('span')!;
    expect(dot.style.width).toBe('16px');
    expect(dot.style.height).toBe('16px');
  });

  it('applies the default connected color', () => {
    const { container } = render(<StatusDot state="connected" />);
    const dot = container.querySelector('span')!;
    expect(dot.style.backgroundColor).toBe('rgb(34, 197, 94)');
  });

  it('applies the default disconnected color', () => {
    const { container } = render(<StatusDot state="disconnected" />);
    const dot = container.querySelector('span')!;
    expect(dot.style.backgroundColor).toBe('rgb(239, 68, 68)');
  });

  it('applies the default error color', () => {
    const { container } = render(<StatusDot state="error" />);
    const dot = container.querySelector('span')!;
    expect(dot.style.backgroundColor).toBe('rgb(220, 38, 38)');
  });

  it('applies custom colors (browser normalizes to rgb)', () => {
    const { container } = render(
      <StatusDot state="connected" colors={{ connected: '#00ff00' }} />
    );
    const dot = container.querySelector('span')!;
    expect(dot.style.backgroundColor).toBe('rgb(0, 255, 0)');
  });

  it('adds animate-pulse for connecting state', () => {
    const { container } = render(<StatusDot state="connecting" />);
    const dot = container.querySelector('span')!;
    expect(dot.className).toContain('animate-pulse');
  });

  it('adds animate-pulse for reconnecting state', () => {
    const { container } = render(<StatusDot state="reconnecting" />);
    const dot = container.querySelector('span')!;
    expect(dot.className).toContain('animate-pulse');
  });

  it('does not add animate-pulse for connected state', () => {
    const { container } = render(<StatusDot state="connected" />);
    const dot = container.querySelector('span')!;
    expect(dot.className).not.toContain('animate-pulse');
  });

  it('applies additional className', () => {
    const { container } = render(<StatusDot state="connected" className="extra-class" />);
    const dot = container.querySelector('span')!;
    expect(dot.className).toContain('extra-class');
  });

  it('always has rounded-full class', () => {
    const { container } = render(<StatusDot state="connected" />);
    const dot = container.querySelector('span')!;
    expect(dot.className).toContain('rounded-full');
  });

  it('renders for all connection states without error', () => {
    allStates.forEach((state) => {
      const { container } = render(<StatusDot state={state} />);
      expect(container.querySelector('span')).toBeInTheDocument();
    });
  });
});
