import { describe, it, expect } from 'vitest';
import { mapWMOCodeToCondition, getAQILabel } from '../services/weatherService';

describe('Weather Service Utilities', () => {
  it('correctly maps WMO code 0 to Clear Sky', () => {
    const condition = mapWMOCodeToCondition(0);
    expect(condition.label).toBe('Clear Sky');
    expect(condition.category).toBe('clear');
  });

  it('correctly maps WMO code 61 to Rain', () => {
    const condition = mapWMOCodeToCondition(61);
    expect(condition.label).toBe('Rain');
    expect(condition.category).toBe('rain');
  });

  it('correctly maps WMO code 95 to Thunderstorm', () => {
    const condition = mapWMOCodeToCondition(95);
    expect(condition.label).toBe('Thunderstorm');
    expect(condition.category).toBe('thunderstorm');
  });

  it('evaluates Air Quality Index labels correctly', () => {
    expect(getAQILabel(20)).toBe('Good');
    expect(getAQILabel(75)).toBe('Moderate');
    expect(getAQILabel(120)).toBe('Unhealthy for Sensitive Groups');
    expect(getAQILabel(180)).toBe('Unhealthy');
    expect(getAQILabel(350)).toBe('Hazardous');
  });
});
