/**
 * @fileoverview Unit tests for modular context intake form components.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BasicEventFields } from '../components/intake/BasicEventFields';
import { PriorityRankingList } from '../components/intake/PriorityRankingList';
import { DemographicsConstraints } from '../components/intake/DemographicsConstraints';
import { WEDDING_PRESET } from '../data/presets';

describe('Intake Sub-Components', () => {
  it('renders and updates BasicEventFields with selects', () => {
    const onUpdateField = vi.fn();
    render(<BasicEventFields context={WEDDING_PRESET} onUpdateField={onUpdateField} />);

    const nameInput = screen.getByLabelText('Event name');
    fireEvent.change(nameInput, { target: { value: 'New Gala' } });
    expect(onUpdateField).toHaveBeenCalledWith('eventName', 'New Gala');

    const occasionSelect = screen.getByLabelText('Select occasion type');
    fireEvent.change(occasionSelect, { target: { value: 'birthday' } });
    expect(onUpdateField).toHaveBeenCalledWith('occasion', 'birthday');

    const tierSelect = screen.getByLabelText('Experience tier');
    fireEvent.change(tierSelect, { target: { value: 'intimate' } });
    expect(onUpdateField).toHaveBeenCalledWith('experienceTier', 'intimate');
  });

  it('renders and updates PriorityRankingList', () => {
    const onUpdateRanking = vi.fn();
    render(
      <PriorityRankingList
        priorityRanking={WEDDING_PRESET.priorityRanking}
        onUpdateRanking={onUpdateRanking}
      />
    );

    expect(screen.getByText(/Priority Ranking/)).toBeDefined();
    const upButtons = screen.getAllByLabelText(/Move .* up/);
    if (upButtons[1]) {
      fireEvent.click(upButtons[1]);
      expect(onUpdateRanking).toHaveBeenCalled();
    }
  });

  it('renders and updates DemographicsConstraints including text inputs and tags', () => {
    const onUpdateField = vi.fn();
    render(<DemographicsConstraints context={WEDDING_PRESET} onUpdateField={onUpdateField} />);

    expect(screen.getByText('Guest Age Mix')).toBeDefined();
    const tagChildren = screen.getByLabelText('Toggle children');
    fireEvent.click(tagChildren);
    expect(onUpdateField).toHaveBeenCalledWith('ageGroups', ['adults', 'seniors']);

    const accessInput = screen.getByLabelText('Accessibility needs');
    fireEvent.change(accessInput, { target: { value: 'Elevator access, Braille' } });
    fireEvent.blur(accessInput);
    expect(onUpdateField).toHaveBeenCalledWith('accessibilityNeeds', ['Elevator access', 'Braille']);

    const mustHavesInput = screen.getByLabelText('Must-have items');
    fireEvent.change(mustHavesInput, { target: { value: 'Fireworks, Drone shoot' } });
    fireEvent.blur(mustHavesInput);
    expect(onUpdateField).toHaveBeenCalledWith('mustHaves', ['Fireworks', 'Drone shoot']);
  });
});
