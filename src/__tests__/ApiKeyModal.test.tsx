/**
 * @fileoverview Tests for the ApiKeyModal component.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApiKeyModal } from '../components/ApiKeyModal';

describe('ApiKeyModal', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ApiKeyModal
        isOpen={false}
        apiKey=""
        onChangeKey={vi.fn()}
        onSave={vi.fn()}
        onClear={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal dialog when open and triggers events', () => {
    const onChangeKey = vi.fn();
    const onSave = vi.fn();
    const onClear = vi.fn();
    const onClose = vi.fn();

    render(
      <ApiKeyModal
        isOpen={true}
        apiKey="test-key"
        onChangeKey={onChangeKey}
        onSave={onSave}
        onClear={onClear}
        onClose={onClose}
      />
    );

    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText('Gemini 2.5 Flash API Key')).toBeDefined();

    const input = screen.getByLabelText('Gemini API key input');
    fireEvent.change(input, { target: { value: 'new-key' } });
    expect(onChangeKey).toHaveBeenCalledWith('new-key');

    const clearBtn = screen.getByLabelText('Clear active API key');
    fireEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalledTimes(1);

    const saveBtn = screen.getByRole('button', { name: 'Save & Connect' });
    fireEvent.click(saveBtn);
    expect(onSave).toHaveBeenCalledTimes(1);

    const closeBtn = screen.getByLabelText('Close API key modal');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('handles Escape key to close', () => {
    const onClose = vi.fn();
    render(
      <ApiKeyModal
        isOpen={true}
        apiKey=""
        onChangeKey={vi.fn()}
        onSave={vi.fn()}
        onClear={vi.fn()}
        onClose={onClose}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
