import type { Meta, StoryObj } from '@storybook/react';
import { WebSocketStatus, WebSocketProvider, WebSocketStatusAuto } from '../src';
import { ConnectionState } from '../src/types';

const meta: Meta<typeof WebSocketStatus> = {
  title: 'Components/WebSocketStatus',
  component: WebSocketStatus,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'select',
      options: ['connecting', 'connected', 'disconnected', 'reconnecting', 'error'],
    },
    layout: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
    size: {
      control: 'range',
      min: 0.5,
      max: 2,
      step: 0.25,
    },
    hideText: { control: 'boolean' },
    hideIcon: { control: 'boolean' },
    useDot: { control: 'boolean' },
    showAttempt: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof WebSocketStatus>;

// Basic States
export const Connected: Story = {
  args: {
    state: 'connected',
  },
};

export const Connecting: Story = {
  args: {
    state: 'connecting',
  },
};

export const Disconnected: Story = {
  args: {
    state: 'disconnected',
  },
};

export const Reconnecting: Story = {
  args: {
    state: 'reconnecting',
    reconnectionAttempt: 3,
    showAttempt: true,
  },
};

export const Error: Story = {
  args: {
    state: 'error',
  },
};

// Layout Variants
export const VerticalLayout: Story = {
  args: {
    state: 'connected',
    layout: 'vertical',
  },
};

export const DotStyle: Story = {
  args: {
    state: 'connected',
    useDot: true,
  },
};

export const AllStatesDots: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <WebSocketStatus state="connected" useDot />
      <WebSocketStatus state="connecting" useDot />
      <WebSocketStatus state="disconnected" useDot />
      <WebSocketStatus state="reconnecting" useDot />
      <WebSocketStatus state="error" useDot />
    </div>
  ),
};

// Size Variants
export const SizeVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <WebSocketStatus state="connected" size={0.5} />
      <WebSocketStatus state="connected" size={0.75} />
      <WebSocketStatus state="connected" size={1} />
      <WebSocketStatus state="connected" size={1.25} />
      <WebSocketStatus state="connected" size={1.5} />
      <WebSocketStatus state="connected" size={2} />
    </div>
  ),
};

// Minimal Variants
export const IconOnly: Story = {
  args: {
    state: 'connected',
    hideText: true,
  },
};

export const TextOnly: Story = {
  args: {
    state: 'connected',
    hideIcon: true,
  },
};

// Custom Styling
export const CustomLabels: Story = {
  args: {
    state: 'connected',
    labels: {
      connected: 'Online',
      connecting: 'Joining...',
      disconnected: 'Offline',
      reconnecting: 'Reconnecting...',
      error: 'Failed',
    },
  },
};

export const CustomColors: Story = {
  args: {
    state: 'connected',
    useDot: true,
    colors: {
      connected: '#00ff88',
      connecting: '#ffaa00',
      reconnecting: '#ffaa00',
      disconnected: '#ff4444',
      error: '#cc0000',
    },
  },
};

// All States Showcase
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <WebSocketStatus state="connected" />
      <WebSocketStatus state="connecting" />
      <WebSocketStatus state="disconnected" />
      <WebSocketStatus state="reconnecting" reconnectionAttempt={2} showAttempt />
      <WebSocketStatus state="error" />
    </div>
  ),
};

// Interactive Demo
const InteractiveDemo = () => {
  const [state, setState] = useState<ConnectionState>('disconnected');

  return (
    <div className="flex flex-col gap-4 items-center">
      <WebSocketStatus state={state} />
      <div className="flex gap-2">
        <button
          onClick={() => setState('connecting')}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          Connecting
        </button>
        <button
          onClick={() => setState('connected')}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >
          Connected
        </button>
        <button
          onClick={() => setState('disconnected')}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Disconnected
        </button>
        <button
          onClick={() => setState('error')}
          className="px-3 py-1 bg-gray-800 text-white rounded"
        >
          Error
        </button>
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};

// Real-time Demo (simulated)
const SimulatedConnection = () => {
  const [state, setState] = useState<ConnectionState>('disconnected');
  const [attempt, setAttempt] = useState(0);

  const connect = () => {
    setState('connecting');
    setTimeout(() => {
      setState('connected');
    }, 1500);
  };

  const disconnect = () => {
    setState('disconnected');
  };

  const simulateReconnect = () => {
    setState('reconnecting');
    setAttempt(1);

    const attempts = [1, 2, 3, 4, 5];
    let i = 0;

    const interval = setInterval(() => {
      i++;
      if (i < attempts.length) {
        setAttempt(attempts[i]);
      } else {
        clearInterval(interval);
        setState('connected');
        setAttempt(0);
      }
    }, 1000);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <WebSocketStatus state={state} reconnectionAttempt={attempt} showAttempt />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={connect}
            disabled={state === 'connected' || state === 'connecting'}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Connect
          </button>
          <button
            onClick={disconnect}
            disabled={state === 'disconnected'}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
          >
            Disconnect
          </button>
          <button
            onClick={simulateReconnect}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            Simulate Reconnection
          </button>
        </div>

        <div className="text-sm text-gray-600 font-mono">
          State: {state} {attempt > 0 && `(attempt ${attempt})`}
        </div>
      </div>
    </div>
  );
};

export const SimulatedWebSocket: Story = {
  render: () => <SimulatedConnection />,
};

import { useState } from 'react';
