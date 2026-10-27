import { describe, expect, it } from 'vitest';
import { parseRoutePath } from './router';

describe('parseRoutePath', () => {
  it('resolves each mode root to its overview', () => {
    expect(parseRoutePath('/red/').page).toBe('overview');
    expect(parseRoutePath('/bus/').page).toBe('overview');
    expect(parseRoutePath('/commuter-rail').page).toBe('overview');
  });
});
