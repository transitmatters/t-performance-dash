/**
 * Parts of the page the guide can point at. Each name goes on the element with `guideAnchor()`.
 * One element can carry several names: on phones, a single "Edit" button holds the stations, dates
 * and trip view that sit apart on desktop.
 */
export type GuideAnchor =
  | 'search'
  | 'lines'
  | 'system'
  | 'scoreboard'
  | 'statusLegend'
  | 'stations'
  | 'dates'
  | 'tripMode';

export const guideAnchor = (...names: GuideAnchor[]) => ({ 'data-guide': names.join(' ') });

/** The first element carrying `name` that's actually on screen, since phone and desktop differ. */
export const findGuideAnchor = (name: GuideAnchor): HTMLElement | undefined =>
  Array.from(document.querySelectorAll<HTMLElement>(`[data-guide~="${name}"]`)).find((element) => {
    const { width, height } = element.getBoundingClientRect();
    return width > 0 && height > 0;
  });
