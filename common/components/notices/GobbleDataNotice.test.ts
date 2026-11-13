import { describe, expect, test } from 'vitest';
import { includesGobbleFerryDay, includesGobbleOnlyBusDay } from './GobbleDataNotice';

const TODAY = '2026-11-10';

describe('includesGobbleOnlyBusDay', () => {
  test('a single date is Gobble-only only when it is today', () => {
    expect(includesGobbleOnlyBusDay(TODAY, undefined, TODAY)).toBe(true);
    expect(includesGobbleOnlyBusDay('2026-11-09', undefined, TODAY)).toBe(false);
    // Between the monthly archive's end and LAMP's old start date, now served from LAMP
    expect(includesGobbleOnlyBusDay('2025-11-15', undefined, TODAY)).toBe(false);
  });

  test('a range is Gobble-only when it reaches today', () => {
    expect(includesGobbleOnlyBusDay('2025-11-10', TODAY, TODAY)).toBe(true);
    expect(includesGobbleOnlyBusDay('2025-11-10', '2026-11-09', TODAY)).toBe(false);
  });

  test('no date at all is not Gobble-only', () => {
    expect(includesGobbleOnlyBusDay(undefined, undefined, TODAY)).toBe(false);
  });
});

describe('includesGobbleFerryDay', () => {
  test('dates past the monthly ferry archive come from Gobble', () => {
    expect(includesGobbleFerryDay('2026-11-05', undefined)).toBe(true);
    expect(includesGobbleFerryDay('2025-07-15', undefined)).toBe(false);
    expect(includesGobbleFerryDay('2026-03-31', undefined)).toBe(false);
  });

  test('a range counts once it reaches past the archive', () => {
    expect(includesGobbleFerryDay('2025-11-10', '2026-11-09')).toBe(true);
    expect(includesGobbleFerryDay('2025-11-10', '2026-03-31')).toBe(false);
  });

  test('no date at all is not Gobble', () => {
    expect(includesGobbleFerryDay(undefined, undefined)).toBe(false);
  });
});
