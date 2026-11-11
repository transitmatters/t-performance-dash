import { describe, expect, it } from 'vitest';
import type { Line } from '../../common/types/lines';
import { getCommandIndex } from './commandIndex';
import { groupResults, searchCommands } from './search';

const search = (query: string, line?: Line) => searchCommands(getCommandIndex(), query, { line });

const ids = (query: string) => search(query).map((command) => command.id);

describe('searchCommands', () => {
  it('matches nothing for an empty query', () => {
    expect(search('')).toEqual([]);
    expect(search('  /  ')).toEqual([]);
  });

  it('puts the line page first for "red speed"', () => {
    expect(ids('red speed')[0]).toBe('page:line-red:speed');
  });

  it('does not match words that merely contain the letters', () => {
    // cmdk's fuzzy match would surface Reading (Haverhill Line) for "red".
    expect(search('red speed').every((command) => command.label !== 'Reading')).toBe(true);
  });

  it('finds a bus route page by number without matching longer numbers', () => {
    const results = ids('route 1 trips');
    expect(results[0]).toBe('routePage:line-bus:1:singleTrips');
    expect(results.some((id) => id.startsWith('routePage:line-bus:10:'))).toBe(false);
    expect(results.some((id) => id.startsWith('routePage:line-bus:111:'))).toBe(false);
  });

  it('finds a route by its number alone', () => {
    expect(ids('66')[0]).toBe('route:line-bus:66');
  });

  it('finds Silver Line routes by their rider-facing names', () => {
    expect(search('sl1')[0]?.label).toBe('Route SL1/SL2/SL3/SLW');
  });

  it('ranks the exact station name above longer ones', () => {
    const stations = search('harvard').filter((command) => command.group === 'Stations');
    expect(stations[0]?.label).toBe('Harvard');
    expect(stations[0]?.line).toBe('line-red');
    expect(stations.map((command) => command.label)).toContain('Harvard Avenue');
  });

  it('ranks names that start with the query first', () => {
    const labels = search('park')
      .filter((command) => command.group === 'Stations')
      .slice(0, 2)
      .map((command) => `${command.label} ${command.line}`);
    expect(labels).toEqual(['Park Street line-red', 'Park Street line-green']);
  });

  it('finds Green Line branch stations by branch letter', () => {
    const labels = search('green b harvard').map((command) => command.label);
    expect(labels[0]).toBe('Harvard Avenue');
  });

  it('finds Commuter Rail lines by name', () => {
    expect(ids('fitchburg')[0]).toBe('route:line-commuter-rail:CR-Fitchburg');
  });

  it('boosts pages on the current line', () => {
    expect(search('speed', 'line-orange')[0]?.id).toBe('page:line-orange:speed');
    expect(search('speed', 'line-green')[0]?.id).toBe('page:line-green:speed');
  });
});

describe('groupResults', () => {
  it('orders groups by their best match and caps each one', () => {
    const sections = groupResults(search('bus speed'), 6);
    expect(sections[0]?.group).toBe('Pages');
    expect(sections[0]?.commands[0]?.id).toBe('page:line-bus:speed');
    expect(sections.every((section) => section.commands.length <= 6)).toBe(true);
  });
});
