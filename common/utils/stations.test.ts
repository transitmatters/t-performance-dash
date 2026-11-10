import { describe, expect, it } from 'vitest';
import { getStationInOptions, optionsStation, stopNoun } from './stations';

describe('getStationInOptions', () => {
  const fairmount = optionsStation('Commuter Rail', undefined, 'CR-Fairmount');

  it("finds a stop among the line's own stations", () => {
    const station = fairmount?.[1];
    expect(getStationInOptions(station?.stops['0'][0], fairmount)).toBe(station);
  });

  it('rejects a stop from another line', () => {
    expect(getStationInOptions('70034', fairmount)).toBeUndefined();
    expect(getStationInOptions('70034', optionsStation('Orange'))?.stop_name).toBe('Malden Center');
  });

  it('treats a missing stop as unset', () => {
    expect(getStationInOptions(undefined, fairmount)).toBeUndefined();
  });
});

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
