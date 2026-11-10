import { enUS } from 'date-fns/locale';
import type { ChartTheme } from '../../../common/utils/chartTheme';
import type { AggType } from '../../speed/constants/speeds';

import 'chartjs-adapter-date-fns';

/** The hover card title for one bar: the day, the week it starts, or the month. */
export const periodTitle = (agg: AggType, label = '') =>
  agg === 'weekly' ? `Week of ${label}` : label;

export const periodName = (agg: AggType) =>
  agg === 'daily' ? 'day' : agg === 'weekly' ? 'week' : 'month';

/** A time x-axis for one bar per period, offset so the first and last bars aren't cut in half. */
export const periodTimeScale = (
  agg: AggType,
  startDate: string,
  endDate: string,
  chartTheme: ChartTheme
) => ({
  stacked: true,
  type: 'time' as const,
  min: startDate,
  max: endDate,
  offset: true,
  grid: { display: false },
  border: { color: chartTheme.axisBorder },
  time: {
    unit:
      agg === 'monthly'
        ? ('year' as const)
        : agg === 'weekly'
          ? ('month' as const)
          : ('week' as const),
    tooltipFormat: agg === 'monthly' ? 'MMM yyyy' : 'MMM d, yyyy',
    displayFormats: { year: 'yyyy', month: 'MMM', week: 'MMM d' },
  },
  ticks: { color: chartTheme.tick },
  adapters: { date: { locale: enUS } },
});
