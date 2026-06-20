/**
 * @fileoverview Component tests for common UI components.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropTypes from 'prop-types';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';
import ProgressBar from '../../components/common/ProgressBar.jsx';
import ErrorBoundary from '../../components/common/ErrorBoundary.jsx';

describe('Button', () => {
  it('should render with children', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(<Button onClick={() => { clicked = true; }}>Click</Button>);
    await user.click(screen.getByText('Click'));
    expect(clicked).toBe(true);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should show loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('should have correct type attribute', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('should apply variant class', () => {
    render(<Button variant="danger" id="test-btn">Delete</Button>);
    const btn = document.getElementById('test-btn');
    expect(btn.classList.contains('btn--danger')).toBe(true);
  });

  it('should render with aria-label', () => {
    render(<Button ariaLabel="Close dialog">X</Button>);
    expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
  });

  it('should have unique id', () => {
    render(<Button id="unique-btn">Test</Button>);
    expect(document.getElementById('unique-btn')).toBeInTheDocument();
  });
});

describe('Card', () => {
  it('should render children', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('should render title when provided', () => {
    render(<Card title="Test Card">Content</Card>);
    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    render(<Card title="Test" icon="🌍">Content</Card>);
    expect(screen.getByText('🌍')).toBeInTheDocument();
  });

  it('should apply variant class', () => {
    render(<Card variant="stat" id="stat-card">Content</Card>);
    const card = document.getElementById('stat-card');
    expect(card.classList.contains('card--stat')).toBe(true);
  });

  it('should have aria-label matching title', () => {
    render(<Card title="My Card">Content</Card>);
    expect(screen.getByLabelText('My Card')).toBeInTheDocument();
  });
});

describe('ProgressBar', () => {
  it('should render with value', () => {
    render(<ProgressBar value={50} label="Progress" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should have correct aria attributes', () => {
    render(<ProgressBar value={75} ariaLabel="Upload progress" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '75');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('should clamp value to 0-100', () => {
    render(<ProgressBar value={150} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '100');
  });

  it('should display percentage text', () => {
    render(<ProgressBar value={42} showValue={true} />);
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('should hide value when showValue is false', () => {
    render(<ProgressBar value={42} showValue={false} />);
    expect(screen.queryByText('42%')).not.toBeInTheDocument();
  });
});

function ErrorThrower({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error('Test Error');
  }
  return <div>No Error</div>;
}

ErrorThrower.propTypes = {
  shouldThrow: PropTypes.bool.isRequired,
};

describe('ErrorBoundary', () => {
  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Normal Child</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Normal Child')).toBeInTheDocument();
  });

  it('should render fallback UI when an error occurs', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ErrorThrower shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('should render custom fallback component if provided', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={<div>Custom Error UI</div>}>
        <ErrorThrower shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('should reset error state when "Try Again" is clicked', async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    let shouldThrow = true;
    const { rerender } = render(
      <ErrorBoundary>
        <ErrorThrower shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    shouldThrow = false;
    rerender(
      <ErrorBoundary>
        <ErrorThrower shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );
    
    await user.click(screen.getByText('Try Again'));
    expect(screen.getByText('No Error')).toBeInTheDocument();
    spy.mockRestore();
  });
});
