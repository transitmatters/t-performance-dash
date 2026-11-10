import classNames from 'classnames';
import { useMemo } from 'react';
import { LINE_COLORS } from '../../../common/constants/colors';
import { useThemeStore } from '../../../common/state/themeStore';
import { hexWithAlpha } from '../../../common/utils/general';
import { TIME_BANDS } from '../../busspeedmap/constants';
import type { TimeBand } from '../../busspeedmap/types';
import { BAND_COLORS } from '../utils/busSpeedBands';

const BUS_YELLOW = LINE_COLORS['line-bus'];

/**
 * All day's fill: the solid look the graph has always had when it's the only line, and a faint
 * backdrop once band lines are drawn over it.
 */
export const ALL_DAY_FILL = {
  solo: hexWithAlpha(BUS_YELLOW, 0.8),
  backdrop: hexWithAlpha(BUS_YELLOW, 0.22),
};

/** Each line's color for the current theme: bus yellow for All day, the band palette otherwise. */
export const useBandColors = (): Record<TimeBand, string> => {
  const isDark = useThemeStore((state) => state.theme) === 'dark';
  return useMemo(
    () =>
      Object.fromEntries(
        TIME_BANDS.map(({ key }) => [
          key,
          key === 'all_day' ? BUS_YELLOW : BAND_COLORS[key][isDark ? 'dark' : 'light'],
        ])
      ) as Record<TimeBand, string>,
    [isDark]
  );
};

interface BusSpeedBandLegendProps {
  visible: TimeBand[];
  colors: Record<TimeBand, string>;
  onChange: (visible: TimeBand[]) => void;
}

/**
 * The bus Speed graph's legend, as buttons that show and hide each line. HTML rather than the
 * Chart.js canvas legend, so it can be reached and toggled from the keyboard and read out with its
 * state. The last line left on can't be turned off, so the chart is never empty.
 */
export const BusSpeedBandLegend = ({ visible, colors, onChange }: BusSpeedBandLegendProps) => {
  const toggle = (key: TimeBand) =>
    onChange(visible.includes(key) ? visible.filter((k) => k !== key) : [...visible, key]);

  return (
    <div role="group" aria-label="Lines shown on the chart" className="flex flex-wrap gap-1.5">
      {TIME_BANDS.map(({ key, label, hours }) => {
        const on = visible.includes(key);
        const isLast = on && visible.length === 1;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={on}
            disabled={isLast}
            title={isLast ? 'At least one line stays on' : undefined}
            onClick={() => toggle(key)}
            className={classNames(
              'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors outline-none',
              'focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed',
              on
                ? 'border-border text-foreground hover:bg-muted'
                : 'border-dashed border-border text-muted-foreground hover:bg-muted'
            )}
          >
            <span
              aria-hidden
              className="h-[3px] w-4 shrink-0 rounded-full"
              // Off, the swatch fades rather than going grey, so the key still says which line it
              // would bring back.
              style={{ backgroundColor: colors[key], opacity: on ? 1 : 0.35 }}
            />
            <span className={classNames('font-medium', !on && 'line-through decoration-1')}>
              {label}
            </span>
            {key !== 'all_day' && <span className="text-muted-foreground">{hours}</span>}
          </button>
        );
      })}
    </div>
  );
};
