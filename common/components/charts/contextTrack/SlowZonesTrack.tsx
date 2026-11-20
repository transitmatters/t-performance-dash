import type { MouseEvent } from 'react';
import { getFormattedTimeString } from '../../../utils/time';
import { hideTrackCard, showTrackCard } from './TrackRow';
import { toFraction } from './segments';
import type { Domain } from './segments';
import type { PlacedSlowZoneRun } from './slowZones';
import { slowZoneCard, slowZoneRunAt } from './slowZones';
import { cn } from '@/common/utils/cn';

interface SlowZonesTrackProps {
  runs: PlacedSlowZoneRun[];
  domain: Domain;
  color: string;
  pinned: boolean;
  onToggle: () => void;
}

const WIDTH = 1000;
const HEIGHT = 100;

/**
 * The time slow zones added to the trip each day, as bars as tall as the delay. Hovering reads a
 * stretch of days and its zones; clicking shades them all on the chart.
 */
export const SlowZonesTrack = ({ runs, domain, color, pinned, onToggle }: SlowZonesTrackProps) => {
  const peak = runs.reduce((max, run) => (run.total > max.total ? run : max), runs[0]);
  const x = (time: number) => toFraction(time, domain) * WIDTH;

  const cardAt = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const time =
      domain.min + ((event.clientX - rect.left) / rect.width) * (domain.max - domain.min);
    const run = slowZoneRunAt(runs, time);
    if (!run) {
      hideTrackCard(event.currentTarget);
      return;
    }
    const middle = (toFraction(run.from, domain) + toFraction(run.to, domain)) / 2;
    showTrackCard(
      event.currentTarget,
      slowZoneCard(run, color, pinned),
      rect.left + middle * rect.width
    );
  };

  return (
    <button
      type="button"
      aria-pressed={pinned}
      aria-label={`Slow zones, up to ${getFormattedTimeString(peak.total)} added. ${pinned ? 'Remove the shading' : 'Shade them on the chart'}`}
      onClick={(event) => {
        onToggle();
        hideTrackCard(event.currentTarget);
      }}
      onMouseMove={cardAt}
      onMouseLeave={(event) => hideTrackCard(event.currentTarget)}
      onFocus={(event) => showTrackCard(event.currentTarget, slowZoneCard(peak, color, pinned))}
      onBlur={(event) => hideTrackCard(event.currentTarget)}
      className={cn(
        'absolute inset-0 rounded-[3px] transition-opacity duration-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden',
        pinned ? 'opacity-100' : 'opacity-60 hover:opacity-100'
      )}
    >
      <svg
        aria-hidden
        width="100%"
        height="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="block overflow-hidden"
      >
        {runs.map((run) => {
          const height = Math.max((run.total / peak.total) * HEIGHT, 8);
          return (
            <rect
              key={run.start}
              x={x(run.from)}
              width={Math.max(x(run.to) - x(run.from), 1)}
              y={HEIGHT - height}
              height={height}
              fill={color}
            />
          );
        })}
      </svg>
    </button>
  );
};
