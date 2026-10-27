/**
 * @fileoverview Unit tests for ErrorBoundary component.
 * Validates error catching, fallback UI display, and reset behavior.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary';

/** Throwing component for testing error boundary handling. */
const BombComponent: React.FC<{ readonly shouldThrow?: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test crash explosion');
  }
  return <div>Safe child content</div>;
};

describe('ErrorBoundary component', () => {
  it('should render children normally when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal content')).toBeDefined();
  });

  it('should render fallback alert UI when child throws an error', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BombComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('Something went wrong')).toBeDefined();
    expect(screen.getByText('Test crash explosion')).toBeDefined();
    expect(screen.getByRole('button', { name: /Reset application and try again/i })).toBeDefined();

    consoleError.mockRestore();
  });

  it('should reset error state when Try Again button is clicked', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    let shouldThrow = true;
    const DynamicChild: React.FC = () => {
      if (shouldThrow) {
        throw new Error('Test crash explosion');
      }
      return <div>Safe child content</div>;
    };

    render(
      <ErrorBoundary>
        <DynamicChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeDefined();

    shouldThrow = false;
    const tryAgainBtn = screen.getByRole('button', { name: /Reset application and try again/i });
    fireEvent.click(tryAgainBtn);

    expect(screen.getByText('Safe child content')).toBeDefined();

    consoleError.mockRestore();
  });
});
