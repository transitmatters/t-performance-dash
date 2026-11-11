import { useAlertDelays, useDailyAlertDelays } from '../../common/api/hooks/delays';
import { TODAY_STRING } from '../../common/constants/dates';
import { getBusRouteIds } from '../../common/constants/lines';
import { getWeekStart } from '../../common/utils/date';
import { useDelimitatedRoute } from '../../common/utils/router';
import { lineToDefaultRouteId } from '../predictions/utils/utils';
import { AGG_PERIOD, delayAggFor } from './format';
import type { DateSpan } from './range';
import { coverRange, splitByWeek } from './range';
import { buildSeries, toActualDelays, toMonthly, withinRange } from './reasonSeries';
import { useGreenBranch } from './useGreenBranch';

/** The delays for the line, route and branch in the URL over these dates, as the Delays page shows them. */
export const useDelays = (startDate: string | undefined, endDate: string | undefined) => {
  const {
    line,
    query: { crRoute, busRoute },
  } = useDelimitatedRoute();
  const greenBranch = useGreenBranch();

  // Green picks its branch from the toggle; commuter rail uses the crRoute from query params.
  const routeId =
    line === 'line-green'
      ? greenBranch.routeId
      : line === 'line-commuter-rail'
        ? crRoute
        : lineToDefaultRouteId(line);

  const agg = startDate && endDate ? delayAggFor(startDate, endDate) : 'weekly';
  // There's no monthly table: months are summed from the weekly rows.
  const fetchAgg = agg === 'daily' ? 'daily' : 'weekly';

  // Bus delays are stored per GTFS route id; grouped labels (e.g. 114/116/117) are summed
  // server-side, and "Bus" is every route together.
  const delaysLine =
    line === 'line-bus' ? (busRoute ? getBusRouteIds(busRoute).join(',') : 'Bus') : routeId;

  const alertDelays = useAlertDelays(
    { start_date: startDate, end_date: endDate, line: delaysLine, agg: fetchAgg },
    Boolean(startDate && endDate && line && delaysLine)
  );

  // The first and last weekly rows run past the selected dates, so totals use daily rows there.
  const split =
    fetchAgg === 'weekly' && startDate && endDate
      ? splitByWeek(startDate, endDate, TODAY_STRING)
      : undefined;
  const edgeSpans = [split?.head, split?.tail].filter((span): span is DateSpan => !!span);
  const edgeDelays = useDailyAlertDelays(line ? delaysLine : undefined, edgeSpans);

  const actual = alertDelays.data && toActualDelays(alertDelays.data);
  const rows =
    actual && startDate && endDate
      ? withinRange(
          actual.rows,
          fetchAgg === 'weekly' ? getWeekStart(startDate) : startDate,
          endDate
        )
      : undefined;
  const delayData = rows && agg === 'monthly' ? toMonthly(rows) : rows;

  const edgesReady = edgeDelays.every((query) => query.data);
  const edgeRows = edgeDelays.flatMap((query) =>
    query.data && actual ? toActualDelays(query.data, actual.isActual).rows : []
  );
  const rangeData =
    actual && rows && edgesReady
      ? split
        ? coverRange(split, actual.rows, edgeRows)
        : rows.map((row) => ({ ...row, days: 1 }))
      : undefined;

  return {
    alertDelays,
    agg,
    period: AGG_PERIOD[agg],
    isActual: actual?.isActual ?? false,
    /** One row per bar. Weekly bars are whole weeks, even where they run past the dates. */
    delayData,
    series: delayData ? buildSeries(delayData, line) : [],
    /** Rows that add up to exactly the selected dates, for totals. */
    rangeData,
    /** Everything rangeData waits on, for a widget's `ready`. */
    rangeQueries: [alertDelays, ...edgeDelays],
    greenBranch,
  } as const;
};
