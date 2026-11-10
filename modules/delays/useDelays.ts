import { useAlertDelays } from '../../common/api/hooks/delays';
import { getBusRouteIds } from '../../common/constants/lines';
import { getWeekStart } from '../../common/utils/date';
import { useDelimitatedRoute } from '../../common/utils/router';
import { lineToDefaultRouteId } from '../predictions/utils/utils';
import { AGG_PERIOD, delayAggFor } from './format';
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

  return {
    alertDelays,
    agg,
    period: AGG_PERIOD[agg],
    isActual: actual?.isActual ?? false,
    delayData,
    series: delayData ? buildSeries(delayData, line) : [],
    greenBranch,
  } as const;
};
