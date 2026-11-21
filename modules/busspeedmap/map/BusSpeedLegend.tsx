import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { Popover, PopoverContent, PopoverTrigger } from '../../../common/components/ui/popover';
import { FOCUS_RING_ON_SURFACE } from '../../../common/styles/general';
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

const ITEM = 'flex items-center gap-1.5';

/**
 * The ramp's label is load-bearing. A running speed leaves out the time at stops, which on the MBTA
 * is a large share of a trip, so read as door-to-door speed it looks too fast; an older archive's
 * arrival-to-arrival speed counts it, so read as driving speed it looks too slow. It says which.
 */
export const BusSpeedLegend = ({ hasDwells }: BusSpeedLegendProps) => {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-stone-600 dark:text-stone-400">
      <div className="flex items-center gap-2">
        <span>{hasDwells ? 'Running speed, mph' : 'Speed incl. time at stops, mph'}</span>
        <div className="flex overflow-hidden rounded-sm">
          {SPEED_COLOR_STOPS.map(([speed, color]) => (
            <div key={speed} className="flex w-9 flex-col items-center">
              <div className="h-2.5 w-full" style={{ backgroundColor: color }} />
              <span className="text-xs leading-tight tabular-nums">{speed}</span>
            </div>
          ))}
        </div>
      </div>
      {hasDwells && (
        <span className={ITEM}>
          <span
            aria-hidden
            className="h-1 w-6 rounded-full"
            style={{ backgroundColor: NO_SPEED_COLOR }}
          />
          Too short to time
        </span>
      )}
      {hasDwells && (
        <span className={ITEM}>
          Time at stop
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
        </span>
      )}
      <span className={ITEM}>
        <span aria-hidden className="w-6 shrink-0 border-t-2 border-dashed border-stone-500" />
        First and last sections
      </span>
      <Popover>
        <PopoverTrigger
          className={`flex size-5 items-center justify-center rounded-full text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 ${FOCUS_RING_ON_SURFACE}`}
          aria-label="How these speeds are measured"
        >
          <FontAwesomeIcon icon={faCircleInfo} className="size-3.5" aria-hidden />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 text-xs text-muted-foreground">
          <p>
            {hasDwells
              ? 'Median speed between stops, from pulling away to pulling in. Time spent at stops is left out, and drawn as dots once zoomed in.'
              : 'Median speed from stop to stop, including time spent waiting at the stop — what a rider on board experiences.'}
          </p>
          <p>
            Zoomed in, dashes mark the first and last sections of most trips, which read differently
            from the rest of a route.
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
};
