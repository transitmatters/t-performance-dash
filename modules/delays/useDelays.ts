import { useAlertDelays, useDailyAlertDelays } from '../../common/api/hooks/delays';
import { TODAY_STRING } from '../../common/constants/dates';
import { getBusRouteDataIds } from '../../common/constants/lines';
import { getWeekStart } from '../../common/utils/date';
import { useLinePage } from '../../common/hooks/usePageParams';
import { lineToDefaultRouteId } from '../predictions/utils/utils';
import { useGreenBranch } from '../../common/hooks/useGreenBranch';
import { AGG_PERIOD, delayAggFor } from './format';
import type { DateSpan } from './range';
import { coverRange, splitByWeek } from './range';
import { buildSeries, toActualDelays, toMonthly, withinRange } from './reasonSeries';

/** The delays for the line, route and branch in the URL over these dates, as the Delays page shows them. */
export const useDelays = (startDate: string, endDate: string) => {
  const { line, crRoute, busRoute } = useLinePage();
  const greenBranch = useGreenBranch();

  // Green picks its branch from the toggle; commuter rail uses the crRoute from query params.
  const routeId =
    line === 'line-green'
      ? greenBranch.routeId
      : line === 'line-commuter-rail'
        ? crRoute
        : lineToDefaultRouteId(line);

  const agg = delayAggFor(startDate, endDate);
  // There's no monthly table: months are summed from the weekly rows.
  const fetchAgg = agg === 'daily' ? 'daily' : 'weekly';

  // Bus delays are stored per GTFS route id; grouped labels (e.g. 114/116/117) are summed
  // server-side, and "Bus" is every route together.
  const delaysLine =
    line === 'line-bus' ? (busRoute ? getBusRouteDataIds(busRoute).join(',') : 'Bus') : routeId;

  const alertDelays = useAlertDelays(
    { start_date: startDate, end_date: endDate, line: delaysLine, agg: fetchAgg },
    Boolean(delaysLine)
  );

  // The first and last weekly rows run past the selected dates, so totals use daily rows there.
  const split = fetchAgg === 'weekly' ? splitByWeek(startDate, endDate, TODAY_STRING) : undefined;
  const edgeSpans = [split?.head, split?.tail].filter((span): span is DateSpan => !!span);
  const edgeDelays = useDailyAlertDelays(delaysLine, edgeSpans);

  const actual = alertDelays.data && toActualDelays(alertDelays.data);
  const rows = actual
    ? withinRange(actual.rows, fetchAgg === 'weekly' ? getWeekStart(startDate) : startDate, endDate)
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
  } as const;
};
