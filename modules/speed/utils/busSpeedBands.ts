import type { DeliveredTripMetricsBus } from '../../../common/types/dataPoints';
import { TIME_BANDS } from '../../busspeedmap/constants';
import type { TimeBand } from '../../busspeedmap/types';

/**
 * Each departure window's line on the bus Speed graph. Slots from the dataviz reference palette,
 * minus its yellow, which belongs to the bus-yellow "All day" line. The order was chosen by running
 * the palette validator over every ordering: chronologically adjacent bands, which usually plot
 * close together, clear CVD ΔE 13 (target 8) and normal-vision ΔE 27 (floor 15) on both the light
 * card and the dark one, and each band clears ΔE 16 against bus yellow. Early AM's magenta sits
 * under 3:1 on white, so the hover card and the CSV carry its values too.
 */
export const BAND_COLORS: Record<Exclude<TimeBand, 'all_day'>, { light: string; dark: string }> = {
  early_am: { light: '#e87ba4', dark: '#d55181' },
  am_peak: { light: '#008300', dark: '#008300' },
  midday: { light: '#6250d6', dark: '#9085e9' },
  pm_peak: { light: '#eb6834', dark: '#d95926' },
  evening: { light: '#2a78d6', dark: '#3987e5' },
  late_night: { light: '#e34948', dark: '#e66767' },
};

/** The first service date with bus speeds, all-day and per band alike. */
export const BUS_SPEED_DATA_START = '2025-12-24';

const SERIES_KEYS = TIME_BANDS.map(({ key }) => key);

/**
 * All day and the two rush hours to start, since all seven lines at once tangle together. The
 * rest are one click away in the legend.
 */
export const DEFAULT_VISIBLE_BANDS: TimeBand[] = ['all_day', 'am_peak', 'pm_peak'];

/**
 * The lines named in the `speedBands` param, in TIME_BANDS order. Unknown keys are dropped, and a
 * param with none left (missing, hand-edited, stale) shows the default lines rather than nothing.
 */
export const parseVisibleBands = (param: string | undefined): TimeBand[] => {
  const named = new Set((param ?? '').split(','));
  const visible = SERIES_KEYS.filter((key) => named.has(key));
  return visible.length > 0 ? visible : DEFAULT_VISIBLE_BANDS;
};

/** The `speedBands` value for a selection: undefined for the default, so untouched links stay clean. */
export const serializeVisibleBands = (visible: TimeBand[]): string | undefined => {
  const ordered = SERIES_KEYS.filter((key) => visible.includes(key));
  const isDefault =
    ordered.length === DEFAULT_VISIBLE_BANDS.length &&
    ordered.every((key, index) => key === DEFAULT_VISIBLE_BANDS[index]);
  return isDefault ? undefined : ordered.join(',');
};

/**
 * mph for one line on one row: the row's own totals for "All day", or that band's. Null when there
 * were no miles to divide, which the chart leaves as a gap rather than plotting 0 mph.
 */
export const bandMph = (
  row: Pick<DeliveredTripMetricsBus, 'miles_covered' | 'total_time' | 'time_bands'>,
  band: TimeBand
): number | null => {
  const totals = band === 'all_day' ? row : row.time_bands?.[band];
  if (!totals?.miles_covered || !totals.total_time) return null;
  return Number((totals.miles_covered / (totals.total_time / 3600)).toFixed(1));
};

/** CSV rows: one mph column per line, in place of the nested band map a spreadsheet can't show. */
export const flattenBandsForCsv = (data: DeliveredTripMetricsBus[]) =>
  data.map((row) => {
    const mphColumns = TIME_BANDS.map(({ key }): [string, number | string] => [
      key === 'all_day' ? 'miles_per_hour' : `${key}_mph`,
      bandMph(row, key) ?? '',
    ]);
    const flat: Record<string, unknown> = { ...row, ...Object.fromEntries(mphColumns) };
    delete flat.time_bands;
    return flat;
  });

export interface BandSpeed {
  band: Exclude<TimeBand, 'all_day'>;
  mph: number;
}

/**
 * The slowest and fastest time of day over the whole range, each band's miles over its hours so a
 * quiet day counts for only the trips it ran. Undefined when no row has a per-band breakdown.
 */
export const bandExtremes = (
  data: Pick<DeliveredTripMetricsBus, 'time_bands'>[]
): { slowest: BandSpeed; fastest: BandSpeed } | undefined => {
  const speeds = TIME_BANDS.flatMap(({ key }): BandSpeed[] => {
    if (key === 'all_day') return [];
    const totals = data.reduce(
      (sum, row) => ({
        miles: sum.miles + (row.time_bands?.[key]?.miles_covered ?? 0),
        hours: sum.hours + (row.time_bands?.[key]?.total_time ?? 0) / 3600,
      }),
      { miles: 0, hours: 0 }
    );
    return totals.miles && totals.hours ? [{ band: key, mph: totals.miles / totals.hours }] : [];
  });
  if (speeds.length === 0) return undefined;
  const sorted = [...speeds].sort((a, b) => a.mph - b.mph);
  return { slowest: sorted[0], fastest: sorted[sorted.length - 1] };
};
