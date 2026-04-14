import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { StatusIcon } from '../components/StatusIcon';
import type { ConnectionState } from '../types';

describe('StatusIcon', () => {
  it('renders an SVG element for each state', () => {
    const states: ConnectionState[] = ['connected', 'connecting', 'disconnected', 'reconnecting', 'error'];
    states.forEach((state) => {
      const { container } = render(<StatusIcon state={state} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('renders WiFi icon for connected state (has circle)', () => {
    const { container } = render(<StatusIcon state="connected" />);
    const svg = container.querySelector('svg')!;
    expect(svg.querySelector('circle')).toBeInTheDocument();
  });

  it('renders WifiOff icon for disconnected state (has line element)', () => {
    const { container } = render(<StatusIcon state="disconnected" />);
    const svg = container.querySelector('svg')!;
    expect(svg.querySelector('line')).toBeInTheDocument();
  });

  it('renders loading icon for connecting state (has animate-spin by default)', () => {
    const { container } = render(<StatusIcon state="connecting" />);
    const svg = container.querySelector('svg')!;
    expect(svg.className.baseVal || svg.getAttribute('class') || '').toContain('animate-spin');
  });

  it('renders loading icon for reconnecting state', () => {
    const { container } = render(<StatusIcon state="reconnecting" />);
    const svg = container.querySelector('svg')!;
    expect(svg.className.baseVal || svg.getAttribute('class') || '').toContain('animate-spin');
  });

  it('does not animate when animated=false for connecting', () => {
    const { container } = render(<StatusIcon state="connecting" animated={false} />);
    const svg = container.querySelector('svg')!;
    const className = svg.className.baseVal || svg.getAttribute('class') || '';
    expect(className).not.toContain('animate-spin');
  });

  it('renders error icon for error state (has circle and line elements)', () => {
    const { container } = render(<StatusIcon state="error" />);
    const svg = container.querySelector('svg')!;
    expect(svg.querySelector('circle')).toBeInTheDocument();
    expect(svg.querySelectorAll('line').length).toBeGreaterThanOrEqual(2);
  });

  it('applies additional className', () => {
    const { container } = render(<StatusIcon state="connected" className="my-icon" />);
    const svg = container.querySelector('svg')!;
    expect(svg.className.baseVal || svg.getAttribute('class') || '').toContain('my-icon');
  });

  it('applies ws-status-icon base class', () => {
    const { container } = render(<StatusIcon state="connected" />);
    const svg = container.querySelector('svg')!;
    expect(svg.className.baseVal || svg.getAttribute('class') || '').toContain('ws-status-icon');
  });

  it('renders without error for different sizes', () => {
    [8, 16, 24, 32, 48].forEach((size) => {
      const { container } = render(<StatusIcon state="connected" size={size} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });
});
