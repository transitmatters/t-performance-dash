import {
  DELAY_COLOR_STOPS,
  DWELL_COLOR,
  DWELL_RADIUS_STOPS,
  FREE_FLOW_HOURS,
  NO_SPEED_COLOR,
  SPEED_COLOR_STOPS,
} from '../constants';
import type { SegmentColorBy } from '../types';
import { formatDwell } from '../utils';

interface BusSpeedLegendProps {
  /**
   * Whether the archive on show has a dwell layer, and so running speeds. Archives published
   * before it have arrival-to-arrival speeds with the time at stops counted in.
   */
  hasDwells: boolean;
  colorBy?: SegmentColorBy;
}

const RAMPS: Record<
  SegmentColorBy,
  { stops: [number, string][]; label: (value: number) => string; low: string; high: string }
> = {
  speed: { stops: SPEED_COLOR_STOPS, label: String, low: 'Slower', high: 'Faster' },
  // Reversed, so slow sits on the left in both, in the same red.
  delay: {
    stops: [...DELAY_COLOR_STOPS].reverse(),
    label: (ratio) => `${ratio}×`,
    low: 'Slower',
    high: 'Light traffic',
  },
};

/** Dots for 15s, 30s and 60s, drawn as they are at zoom 14, a little over halfway in. */
const LEGEND_DWELLS = DWELL_RADIUS_STOPS.filter(([seconds]) => seconds > 0 && seconds <= 60).map(
  ([seconds, radius]) => ({ seconds, radius: radius * 0.7 })
);

/**
 * The captions are load-bearing. A running speed leaves out the time at stops, which on the MBTA
 * is a large share of a trip, so read as door-to-door speed it looks too fast; an older archive's
 * arrival-to-arrival speed counts it, so read as driving speed it looks too slow. Each says which
 * it is.
 */
export const BusSpeedLegend = ({ hasDwells, colorBy = 'speed' }: BusSpeedLegendProps) => {
  const ramp = RAMPS[colorBy];
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-600">{ramp.low}</span>
          <div className="flex overflow-hidden rounded-sm border border-stone-300">
            {ramp.stops.map(([value, color]) => (
              <div key={value} className="flex w-12 flex-col items-center">
                <div className="h-3 w-full" style={{ backgroundColor: color }} />
                <span className="text-[10px] leading-tight text-stone-600">
                  {ramp.label(value)}
                </span>
              </div>
            ))}
          </div>
          <span className="text-xs text-stone-600">{ramp.high}</span>
        </div>
        {hasDwells && (
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-1 w-6 rounded-full"
              style={{ backgroundColor: NO_SPEED_COLOR }}
            />
            <span className="text-xs text-stone-600">
              {colorBy === 'delay'
                ? 'Too short to time, or too few trips in light traffic'
                : 'Too short to time'}
            </span>
          </div>
        )}
      </div>
      {colorBy === 'delay' ? (
        <p className="text-xs text-stone-600 italic">
          How long the median trip took between stops, against the same stretch in light traffic:
          trips {FREE_FLOW_HOURS}. Counts any hold-up between stops, from traffic and signals alike,
          but not time spent at stops.
        </p>
      ) : hasDwells ? (
        <p className="text-xs text-stone-600 italic">
          Median speed between stops, from pulling away to pulling in. Time spent at stops is left
          out, and drawn as dots once zoomed in.
        </p>
      ) : (
        <p className="text-xs text-stone-600 italic">
          Median speed from stop to stop, including time spent waiting at the stop — what a rider on
          board experiences.
        </p>
      )}
      {hasDwells && (
        <div className="flex items-center gap-3 text-xs text-stone-600">
          <span className="italic">Median time at stop</span>
          {LEGEND_DWELLS.map(({ seconds, radius }) => (
            <span key={seconds} className="flex items-center gap-1">
              <svg aria-hidden width={radius * 2 + 2} height={radius * 2 + 2}>
                <circle
                  cx={radius + 1}
                  cy={radius + 1}
                  r={radius}
                  fill={DWELL_COLOR}
                  fillOpacity={0.85}
                  stroke="#ffffff"
                />
              </svg>
              {formatDwell(seconds)}
            </span>
          ))}
        </div>
      )}
      <p className="flex items-center gap-2 text-xs text-stone-600 italic">
        <span aria-hidden className="w-6 shrink-0 border-t-2 border-dashed border-stone-500" />
        Zoomed in, dashes mark the first and last sections of most trips, which read differently
        from the rest of a route.
      </p>
    </div>
  );
};
