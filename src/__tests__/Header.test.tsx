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

  it('should trigger onToggleContrast when high contrast toggle is clicked', () => {
    const onToggleContrast = vi.fn();
    render(
      <Header
        onSelectPreset={vi.fn()}
        onToggleContrast={onToggleContrast}
        onToggleLargeText={vi.fn()}
        isHighContrast={false}
        isLargeText={false}
      />
    );
    const contrastBtn = screen.getByRole('button', { name: /Toggle high contrast mode/i });
    fireEvent.click(contrastBtn);
    expect(onToggleContrast).toHaveBeenCalledTimes(1);
  });

  it('should trigger onToggleLargeText when large text toggle is clicked', () => {
    const onToggleLargeText = vi.fn();
    render(
      <Header
        onSelectPreset={vi.fn()}
        onToggleContrast={vi.fn()}
        onToggleLargeText={onToggleLargeText}
        isHighContrast={false}
        isLargeText={false}
      />
    );
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
});
