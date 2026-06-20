/**
 * @fileoverview Error boundary component for graceful error handling.
 * Catches JavaScript errors in child component tree and displays
 * a fallback UI instead of crashing the entire application.
 * @module components/common/ErrorBoundary
 */

import { Component } from 'react';

/**
 * Error boundary component.
 * @extends {Component}
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary" role="alert" aria-live="assertive">
          <div className="error-boundary__content">
            <span className="error-boundary__icon" aria-hidden="true">⚠️</span>
            <h2 className="error-boundary__title">Something went wrong</h2>
            <p className="error-boundary__message">
              An unexpected error occurred. Please try refreshing the page or click the button below.
            </p>
            <button
              className="btn btn--primary"
              onClick={this.handleReset}
              type="button"
              id="error-boundary-reset-btn"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
