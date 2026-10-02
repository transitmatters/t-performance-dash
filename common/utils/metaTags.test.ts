import { describe, expect, it } from 'vitest';
import { getMetaTags } from './metaTags';

describe('getMetaTags', () => {
  it('names the line and page', () => {
    expect(getMetaTags('/red/speed/')).toEqual({
      title: 'Red Line | Speed | Data Dashboard',
      description: 'Red Line speed data on the TransitMatters Data Dashboard.',
      canonicalUrl: 'https://dashboard.transitmatters.org/red/speed/',
    });
  });

  it('describes a trip with its dates', () => {
    const tags = getMetaTags(
      '/red/trips/single/',
      { date: '2024-01-01' },
      'Davis to Porter',
      '?x=1'
    );
    expect(tags.title).toBe('Red Line | Davis to Porter | Data Dashboard');
    expect(tags.description).toBe(
      'Davis to Porter on 2024-01-01 on the Red Line, from the TransitMatters Data Dashboard.'
    );
    expect(tags.canonicalUrl).toBe('https://dashboard.transitmatters.org/red/trips/single/?x=1');
  });

  it('falls back to the site description off a line', () => {
    expect(getMetaTags('/system/slowzones/').title).toBe('Slow Zones | Data Dashboard');
  });
});
