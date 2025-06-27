import { render, screen, act, fireEvent } from '@testing-library/react';
import App from '@/App';
import { describe, it, expect, beforeEach, afterEach, vi,   } from 'vitest';

describe('App Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Test Case: Renders the main title
  it('should render the title', () => {
    render(<App />);
    expect(screen.getByText('Elevator Control System')).toBeInTheDocument();
  });

  // Test Case: Renders the system status information
  it('should render the system status', () => {
    render(<App />);
    expect(screen.getByText('Building: 10 floors')).toBeInTheDocument();
    expect(screen.getByText('Elevators: 4 cars')).toBeInTheDocument();
    expect(screen.getByText('Travel time: 10s per floor')).toBeInTheDocument();
    expect(screen.getByText('Door operation: 10s')).toBeInTheDocument();
  });

  // Test Case: Renders logs when clicking the request button
  it('should render logs when clicking request button', async () => {
    const { container } = render(<App />); // Keep container for querySelectorAll example

    let nodes = container.querySelectorAll('article.app-log');
    expect(nodes.length).toBe(0);

    const requestButton = screen.getByRole('button', { name: /request elevator/i });

    await act(async () => {
      fireEvent.click(requestButton);
    });

    nodes = container.querySelectorAll('article.app-log');
    expect(nodes.length).toBeGreaterThan(0);
  });
});
