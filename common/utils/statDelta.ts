export type StatSentiment = 'good' | 'bad' | 'flat';

export interface StatDelta {
  label: string;
  sentiment: StatSentiment;
  /** What the change compares, shown in a popover on the badge. */
  detail?: string;
}

const sign = (value: number) => (Math.round(value * 100) > 0 ? '+' : '');

/** A 0–1 share as a whole-number percentage, e.g. 0.33 → "33%". */
export const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

/**
 * The difference between two 0–1 shares, e.g. 0.13 → "+13%". Paired with a before → after detail,
 * so readers see it is a change in points rather than a relative change.
 */
export const formatPercentChange = (delta: number, { signed = true } = {}) =>
  `${signed ? sign(delta) : ''}${formatPercent(delta)}`;

/** Every page's change badge compares the averages of the two halves of the selected dates. */
export const halvesDetail = (before: number, after: number, format: (value: number) => string) =>
  Number.isFinite(before) && Number.isFinite(after)
    ? `${format(before)} → ${format(after)}, first half vs. second half of the selected dates`
    : undefined;

interface StatDeltaOptions {
  delta: number;
  /** Changes this small or smaller read as flat. */
  negligible: number;
  /** The badge text for the change, sign included. */
  magnitude: string;
  /** Words for a good and a bad change, e.g. ['faster', 'slower']. */
  words?: [good: string, bad: string];
  higherIsBetter?: boolean;
  detail?: string;
}

export const statDelta = ({
  delta,
  negligible,
  magnitude,
  words,
  higherIsBetter = true,
  detail,
}: StatDeltaOptions): StatDelta | undefined => {
  if (!Number.isFinite(delta)) return undefined;
  const sentiment: StatSentiment =
    Math.abs(delta) <= negligible ? 'flat' : delta > 0 === higherIsBetter ? 'good' : 'bad';
  const word = !words
    ? undefined
    : sentiment === 'flat'
      ? 'flat'
      : words[sentiment === 'good' ? 0 : 1];
  return { label: word ? `${magnitude} · ${word}` : magnitude, sentiment, detail };
};
