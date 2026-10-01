import { describe, expect, it } from 'vitest';
import { getMetaTagEntries, getMetaTags, getOgCard, ogImageSlug } from './metaTags';

describe('getMetaTags', () => {
  it('names the line and page', () => {
    expect(getMetaTags('/red/speed/')).toEqual({
      title: 'Red Line | Speed | Data Dashboard',
      description: 'Red Line speed data on the TransitMatters Data Dashboard.',
      canonicalUrl: 'https://dashboard.transitmatters.org/red/speed/',
      image: 'https://dashboard.transitmatters.org/static/og/red/speed.png',
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

describe('og cards', () => {
  it('slugs paths into card file names', () => {
    expect(ogImageSlug('/')).toBe('index');
    expect(ogImageSlug('/red/')).toBe('red');
    expect(ogImageSlug('/red/trips/single/')).toBe('red/trips/single');
  });

  it('points prerendered pages at their card, with its size', () => {
    const entries = getMetaTagEntries(getMetaTags('/orange/slowzones/'));
    const content = (key: string) => entries.find(([, k]) => k === key)?.[2];
    expect(content('og:image')).toBe(
      'https://dashboard.transitmatters.org/static/og/orange/slowzones.png'
    );
    expect(content('twitter:image')).toBe(content('og:image'));
    expect(content('og:image:width')).toBe('1200');
    expect(content('og:image:height')).toBe('630');
  });

  it("uses the landing page's card for 404s and paths without one", () => {
    for (const path of ['/404/', '/blue/leaderboard/']) {
      const entries = getMetaTagEntries(getMetaTags(path));
      expect(entries.find(([, k]) => k === 'og:image')?.[2]).toBe(
        'https://dashboard.transitmatters.org/static/og/index.png'
      );
    }
  });

  it('labels line, system and other pages', () => {
    expect(getOgCard('/red/slowzones/')).toEqual({
      slug: 'red/slowzones',
      path: '/red/slowzones/',
      lineKey: 'line-red',
      page: 'slowzones',
      heading: 'Red Line',
      subheading: 'Slow Zones',
      color: '#da291c',
    });
    expect(getOgCard('/green/')).toMatchObject({ page: '', subheading: 'Overview' });
    expect(getOgCard('/system/slowzones/')).toMatchObject({
      lineKey: null,
      page: 'system/slowzones',
      heading: 'Systemwide',
      subheading: 'Slow Zones',
    });
    expect(getOgCard('/')).toMatchObject({
      heading: 'Data Dashboard',
      subheading: 'MBTA subway, bus and commuter rail performance',
    });
    expect(getOgCard('/opensource/')).toMatchObject({ heading: 'Open Source', subheading: null });
  });
});
