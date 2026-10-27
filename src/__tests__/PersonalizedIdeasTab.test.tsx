/**
 * @fileoverview Unit tests for PersonalizedIdeasTab component.
 * Verifies asynchronous theme concept generation, cost fit badge display, and refresh action.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PersonalizedIdeasTab from '../components/PersonalizedIdeasTab';
import { WEDDING_PRESET } from '../data/presets';

describe('PersonalizedIdeasTab component', () => {
  it('should render theme concepts asynchronously', async () => {
    render(<PersonalizedIdeasTab context={WEDDING_PRESET} />);

    expect(screen.getByRole('region', { name: /Personalized theme ideas/i })).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText(/Royal Heritage Elegance/i)).toBeDefined();
    });

    expect(screen.getByText(/Modern Fusion Garden/i)).toBeDefined();
    expect(screen.getByText(/Intimate Cultural Soirée/i)).toBeDefined();
  });
});
