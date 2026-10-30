/**
 * @fileoverview React Error Boundary for graceful crash recovery.
 * Catches unhandled errors in the component tree and displays a
 * user-friendly fallback UI with a retry mechanism.
 */

import React from 'react';
import { extractErrorMessage } from '../utils/uiHelpers';
import { logger } from '../utils/logger';

/** Props for the ErrorBoundary component. */
interface ErrorBoundaryProps {
  readonly children: React.ReactNode;
}

/** State tracking caught errors. */
interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly errorMessage: string;
}

/**
 * Catches unhandled errors in child components and renders a fallback UI.
 * Provides a "Try Again" button that resets the error state.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  /**
   * Derives error state from caught errors.
   *
   * @param error - The thrown error object.
   * @returns Updated state with error information.
   */
  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const message = extractErrorMessage(error);
    return { hasError: true, errorMessage: message };
  }

  /**
   * Dispatches caught error details to the structured cloud logger.
   *
   * @param error - The caught Error object.
   * @param errorInfo - React component stack information.
   */
  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error('Unhandled component error caught by ErrorBoundary', {
      error: error.message,
      componentStack: errorInfo.componentStack ?? '',
    });
  }

  /**
   * Resets the error state to allow re-rendering children.
   */
  private readonly handleReset = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  /**
   * Renders children or fallback error UI.
   *
   * @returns The rendered React node.
   */
  override render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="flex min-h-screen items-center justify-center bg-slate-950 p-8"
          role="alert"
        >
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-slate-900 p-8 text-center shadow-2xl">
            <h1 className="mb-3 text-2xl font-bold text-red-400">Something went wrong</h1>
            <p className="mb-6 text-sm text-slate-400">{this.state.errorMessage}</p>
            <button
              onClick={this.handleReset}
              className="rounded-lg bg-saffron-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-saffron-500"
              aria-label="Reset application and try again"
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
