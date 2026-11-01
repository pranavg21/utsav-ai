/**
 * @fileoverview Component test for Event Name text input handling (9.7).
 * Verifies that typing with spaces functions correctly without premature trimming.
 */

import React, { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BasicEventFields } from '../components/intake/BasicEventFields';
import { WEDDING_PRESET } from '../data/presets';
import type { EventContext } from '../types/planner';

const TestContainer: React.FC = () => {
  const [context, setContext] = useState<EventContext>(WEDDING_PRESET);
  const handleUpdate = <K extends keyof EventContext>(key: K, value: EventContext[K]): void => {
    setContext((prev) => ({ ...prev, [key]: value }));
  };
  return <BasicEventFields context={context} onUpdateField={handleUpdate} />;
};

describe('Event Name typing test (9.7)', () => {
  it('types "Grand Family Wedding" into Event Name and preserves spaces during typing', async () => {
    const user = userEvent.setup();
    render(<TestContainer />);
    const input = screen.getByLabelText(/Event name/i);
    await user.clear(input);
    await user.type(input, 'Grand Family Wedding');
    if (input instanceof HTMLInputElement) {
      expect(input.value).toBe('Grand Family Wedding');
    } else {
      throw new Error('Not an HTMLInputElement');
    }
  });
});
