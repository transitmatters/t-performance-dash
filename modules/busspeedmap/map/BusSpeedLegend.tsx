import { DWELL_COLOR, DWELL_RADIUS_STOPS, NO_SPEED_COLOR, SPEED_COLOR_STOPS } from '../constants';
import { formatDwell } from '../utils';

interface BusSpeedLegendProps {
  /**
   * Whether the archive on show has a dwell layer, and so running speeds. Archives published
   * before it have arrival-to-arrival speeds with the time at stops counted in.
   */
  hasDwells: boolean;
}

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
export const BusSpeedLegend = ({ hasDwells }: BusSpeedLegendProps) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-600">Slower</span>
          <div className="flex overflow-hidden rounded-sm border border-stone-300">
            {SPEED_COLOR_STOPS.map(([speed, color]) => (
              <div key={speed} className="flex w-12 flex-col items-center">
                <div className="h-3 w-full" style={{ backgroundColor: color }} />
                <span className="text-[10px] leading-tight text-stone-600">{speed}</span>
              </div>
            ))}
          </div>
          <span className="text-xs text-stone-600">Faster</span>
        </div>
        {hasDwells && (
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-1 w-6 rounded-full"
              style={{ backgroundColor: NO_SPEED_COLOR }}
            />
            <span className="text-xs text-stone-600">Too short to time</span>
          </div>
        )}
      </div>
      {hasDwells ? (
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
