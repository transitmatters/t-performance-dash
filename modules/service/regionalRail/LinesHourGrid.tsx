import { useLocation } from '@tanstack/react-router';
import { Link } from '../../../common/components/general/Link';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import { ChartActions } from '../../../common/components/charts/ChartActions';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import type { CrScorecardEntry } from '../../../common/types/dataPoints';
import type { CommuterRailRoute } from '../../../common/types/lines';
import { COMMUTER_RAIL_LINE_NAMES } from '../../../common/types/lines';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { cn } from '../../../common/utils/cn';
import { HourGrid, HourGridHeader, HourGridLegend, HourGridRow } from './HourGrid';
import {
  SPAN_HOURS,
  SPAN_HOUR_INDEXES,
  TONE_CHIP,
  formatCount,
  formatHour,
  formatMinutes,
  getScorecardStats,
  hoursTone,
  weakerByHour,
} from './utils';

interface LinesHourGridProps {
  data: CrScorecardEntry[];
  dayLabel: string;
  startDate: string;
  endDate: string;
}

/** Every line's hours side by side, closest to Regional Rail first. */
export const LinesHourGrid = ({ data, dayLabel, startDate, endDate }: LinesHourGridProps) => {
  const { query } = useDelimitatedRoute();
  const { pathname } = useLocation();
  const rows = data
    // Lines the dashboard knows about; leaves out event-only service like Foxboro
    .filter((entry) => entry.routeId && entry.routeId in COMMUTER_RAIL_LINE_NAMES)
    .map((entry) => ({
      routeId: entry.routeId as CommuterRailRoute,
      hours: weakerByHour(entry),
      ...getScorecardStats([entry]),
    }))
    .sort(
      (a, b) =>
        (b.hoursAtTarget ?? 0) - (a.hoursAtTarget ?? 0) ||
        (a.maxGapMidday ?? Infinity) - (b.maxGapMidday ?? Infinity)
    );
  if (rows.length === 0) {
    return <NoDataNotice isLineMetric />;
  }
  const csv = rows.map((row) => ({
    line: COMMUTER_RAIL_LINE_NAMES[row.routeId],
    trains_per_day: row.tripsPerDay,
    hours_every_30_min: row.hoursAtTarget,
    longest_midday_wait_min: row.maxGapMidday,
    longest_evening_wait_min: row.maxGapEvening,
    clock_face_share: row.clockFaceShare,
    ...Object.fromEntries(
      SPAN_HOUR_INDEXES.map((hour) => [`trains_${formatHour(hour)}`, row.hours[hour]])
    ),
  }));
  return (
    <ChartStack>
      <HourGrid>
        <HourGridHeader stats={['Trains / day', 'Hours every 30 min', 'Midday wait']} />
        {rows.map((row) => {
          const name = COMMUTER_RAIL_LINE_NAMES[row.routeId];
          return (
            <HourGridRow
              key={row.routeId}
              label={
                <Link
                  href={{
                    pathname,
                    query: { ...query, crRoute: row.routeId, serviceScope: undefined },
                  }}
                  className="hover:underline"
                >
                  {name.replace(/ Line$/, '')}
                </Link>
              }
              hours={row.hours}
              describe={(hour, trains) =>
                `${name}, ${formatHour(hour)}: ${trains == null ? 'no data' : `${trains.toFixed(1)} trains`} in the weaker direction on an average ${dayLabel}`
              }
              stats={[
                formatCount(row.tripsPerDay),
                <span
                  key="hours"
                  className={cn(
                    'rounded-md px-1.5 py-0.5',
                    row.hoursAtTarget != null && TONE_CHIP[hoursTone(row.hoursAtTarget)]
                  )}
                >
                  {formatCount(row.hoursAtTarget)}/{SPAN_HOURS}
                </span>,
                formatMinutes(row.maxGapMidday),
              ]}
            />
          );
        })}
        <HourGridLegend>
          <span>Weaker direction · Regional Rail runs a train at least every 30 minutes</span>
        </HourGridLegend>
      </HourGrid>
      <ChartActions
        datasetName="cr-lines-service-pattern"
        csv={csv}
        startDate={startDate}
        endDate={endDate}
      />
    </ChartStack>
  );
};
