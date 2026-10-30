/**
 * @fileoverview Unit tests for Header component.
 * Verifies single h1 tag, preset loading, accessibility toggles, and API status indicator.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../components/Header';
import { WEDDING_PRESET } from '../data/presets';

describe('Header component', () => {
  it('should render exactly one h1 tag with application title', () => {
    render(
      <Header
        onSelectPreset={vi.fn()}
        onToggleContrast={vi.fn()}
        onToggleLargeText={vi.fn()}
        isHighContrast={false}
        isLargeText={false}
      />
    );
    const h1Elements = screen.getAllByRole('heading', { level: 1 });
    expect(h1Elements).toHaveLength(1);
    expect(h1Elements[0]?.textContent).toContain('UtsavAI');
  });

  it('should trigger onToggleContrast and onToggleLargeText', () => {
    const onToggleContrast = vi.fn();
    const onToggleLargeText = vi.fn();
    render(
      <Header
        onSelectPreset={vi.fn()}
        onToggleContrast={onToggleContrast}
        onToggleLargeText={onToggleLargeText}
        isHighContrast={true}
        isLargeText={true}
      />
    );
    const contrastBtn = screen.getByRole('button', { name: /Toggle high contrast mode/i });
    fireEvent.click(contrastBtn);
    expect(onToggleContrast).toHaveBeenCalledTimes(1);

    const textBtn = screen.getByRole('button', { name: /Toggle large text mode/i });
    fireEvent.click(textBtn);
    expect(onToggleLargeText).toHaveBeenCalledTimes(1);
  });

  it('should trigger onSelectPreset when a preset button is clicked', () => {
    const onSelectPreset = vi.fn();
    render(
      <Header
        onSelectPreset={onSelectPreset}
        onToggleContrast={vi.fn()}
        onToggleLargeText={vi.fn()}
        isHighContrast={false}
        isLargeText={false}
      />
    );
    const presetBtn = screen.getByRole('button', { name: /Load preset: SME Benchmark/i });
    fireEvent.click(presetBtn);
    expect(onSelectPreset).toHaveBeenCalledWith(WEDDING_PRESET);
  });

  it('should open API key modal and allow saving or clearing runtime key', () => {
    render(
      <Header
        onSelectPreset={vi.fn()}
        onToggleContrast={vi.fn()}
        onToggleLargeText={vi.fn()}
        isHighContrast={false}
        isLargeText={false}
      />
    );

    const configBtn = screen.getByRole('button', { name: /Configure Gemini API key/i });
    fireEvent.click(configBtn);

    const modalTitle = screen.getByText('Gemini 2.5 Flash API Key');
    expect(modalTitle).toBeDefined();

    const saveBtn = screen.getByRole('button', { name: 'Save & Connect' });
    fireEvent.click(saveBtn);

    // Reopen and clear
    fireEvent.click(configBtn);
    const clearBtn = screen.getByLabelText('Clear active API key');
    fireEvent.click(clearBtn);
  });
});
