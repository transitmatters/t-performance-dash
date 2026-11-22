import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALL_PAGES } from '../../common/constants/pages';
import type { Page } from '../../common/constants/pages';
import type { GuideNodeId } from './tree';
import { GUIDE_TREE, PAGE_NODES, pageNode, targetFor } from './tree';

const ids = Object.keys(GUIDE_TREE) as GuideNodeId[];
const pageNodeIds = [
  ...new Set([...Object.values(PAGE_NODES), pageNode('singleTrips', 'line-bus')]),
];

/** Where each node's choices can lead. `here` can be any page's node. */
const edges = (id: GuideNodeId): GuideNodeId[] =>
  GUIDE_TREE[id].choices.flatMap(({ next }) => {
    if (next === 'close') return [];
    if (next === 'here') return pageNodeIds;
    return [next];
  });

const reachableFrom = (starts: GuideNodeId[]) => {
  const seen = new Set<GuideNodeId>(starts);
  const queue = [...starts];
  while (queue.length) {
    for (const next of edges(queue.shift()!)) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return seen;
};

describe('the guide tree', () => {
  it('can reach every node from where it opens', () => {
    // `goodbye` is the bubble's "Don't show Dash" link, under every node's choices.
    const reachable = reachableFrom(['welcome', 'goodbye', ...pageNodeIds]);
    expect(ids.filter((id) => !reachable.has(id))).toEqual([]);
  });

  it('can always get back to the start without the Back button', () => {
    const stuck = ids.filter((id) => !reachableFrom([id]).has('welcome'));
    expect(stuck).toEqual([]);
  });

  it('opens on a node about every page', () => {
    const pages = Object.keys(ALL_PAGES) as Page[];
    expect(pages.filter((page) => !PAGE_NODES[page])).toEqual([]);
  });

  it.each(ids)('keeps %s short enough for a speech bubble', (id) => {
    const { say, choices } = GUIDE_TREE[id];
    expect(say.length).toBeGreaterThan(0);
    expect(say.length).toBeLessThanOrEqual(2);
    expect(say.join(' ').length).toBeLessThanOrEqual(300);
    expect(choices.length).toBeGreaterThan(0);
    expect(choices.length).toBeLessThanOrEqual(6);
    for (const { label } of choices) expect(label.length).toBeLessThanOrEqual(36);
    expect(new Set(choices.map(({ label }) => label)).size).toBe(choices.length);
  });

  it('only sends people to pages their line has', () => {
    const wrong = ids.flatMap((id) =>
      GUIDE_TREE[id].choices.flatMap(({ label, go }) => {
        if (!go) return [];
        const targets =
          go.kind === 'linePage'
            ? [go.fallback ?? targetFor(go, { line: undefined, query: {} })]
            : [go];
        return targets
          .filter((target) => target.kind === 'page' && !target.page.lines.includes(target.line))
          .map(() => `${id}: ${label}`);
      })
    );
    expect(wrong).toEqual([]);
  });

  it('points only at parts of the page that are marked with guideAnchor()', () => {
    const roots = ['common', 'modules'].map((dir) => join(__dirname, '..', '..', dir));
    const source = roots
      .flatMap((root) =>
        (readdirSync(root, { recursive: true }) as string[])
          .filter((file) => file.endsWith('.tsx'))
          .map((file) => readFileSync(join(root, file), 'utf8'))
      )
      .join('\n');
    const placed = new Set(
      [...source.matchAll(/guideAnchor\(([^)]*)\)/g)].flatMap(([, args]) =>
        [...args.matchAll(/'([a-zA-Z]+)'/g)].map(([, name]) => name)
      )
    );
    const missing = ids.filter((id) => GUIDE_TREE[id].point && !placed.has(GUIDE_TREE[id].point));
    expect(missing).toEqual([]);
  });
});

describe('targetFor', () => {
  const speed = { kind: 'linePage', page: ALL_PAGES.speed } as const;

  it("opens the page on the line you're looking at, keeping your route", () => {
    expect(targetFor(speed, { line: 'line-bus', query: { busRoute: '28' } })).toEqual({
      kind: 'page',
      line: 'line-bus',
      page: ALL_PAGES.speed,
      route: '28',
    });
  });

  it("falls back when your line doesn't have the page", () => {
    const fallback = { kind: 'href', href: '/system/slowzones' } as const;
    const slowZones = { kind: 'linePage', page: ALL_PAGES.slowzones, fallback } as const;
    expect(targetFor(slowZones, { line: 'line-bus', query: {} })).toBe(fallback);
  });

  it('uses the Red Line when no line is open', () => {
    expect(targetFor(speed, { line: undefined, query: {} })).toEqual({
      kind: 'page',
      line: 'line-red',
      page: ALL_PAGES.speed,
    });
  });
});

describe('pageNode', () => {
  it('asks bus riders for a route on the trip page', () => {
    expect(pageNode('singleTrips', 'line-bus')).toBe('aboutBusTrips');
    expect(pageNode('singleTrips', 'line-red')).toBe('aboutTrips');
  });

  it('says hello on a page it has nothing about', () => {
    expect(pageNode(undefined, undefined)).toBe('welcome');
  });
});
