import { describe, expect, it } from 'vitest';
import { stopNoun } from './stations';

describe('stopNoun', () => {
  it('calls bus and ferry stops "stop"', () => {
    expect(stopNoun('Bus')).toBe('stop');
    expect(stopNoun('Ferry')).toBe('stop');
  });

  it('calls rail stops "station"', () => {
    expect(stopNoun('Red')).toBe('station');
    expect(stopNoun('Commuter Rail')).toBe('station');
    expect(stopNoun(undefined)).toBe('station');
  });
});
