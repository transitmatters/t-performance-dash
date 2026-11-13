import { ChartActions } from '../../../common/components/charts/ChartActions';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import { StatCell, StatStripGrid } from '../../../common/components/widgets/StatStrip';
import type { CrScorecardEntry } from '../../../common/types/dataPoints';
import { HourGrid, HourGridHeader, HourGridLegend, HourGridRow } from './HourGrid';
import type { getScorecardStats } from './utils';
import {
  DIRECTIONS,
  SPAN_HOURS,
  SPAN_HOUR_INDEXES,
  averageByHour,
  directionMean,
  formatCount,
  formatHour,
  formatMinutes,
  formatShare,
} from './utils';

interface ServicePatternProps {
  data: CrScorecardEntry[];
  stats: ReturnType<typeof getScorecardStats> | null;
  dayLabel: string;
  startDate: string;
  endDate: string;
}

/** A line's average day, hour by hour in each direction, with the rest of its numbers underneath. */
export const ServicePattern = ({
  data,
  stats,
  dayLabel,
  startDate,
  endDate,
}: ServicePatternProps) => {
  if (data.length === 0) {
    return <NoDataNotice isLineMetric shutdownScope="line" />;
  }
  const directions = DIRECTIONS.map(({ key, label }) => ({
    key,
    label,
    hours: averageByHour(data, key),
    trips: directionMean(data, key, 'trips'),
    hoursAtTarget: directionMean(data, key, 'hoursAtTarget'),
  }));
  const csv = SPAN_HOUR_INDEXES.map((hour) => ({
    hour: formatHour(hour),
    ...Object.fromEntries(directions.map(({ key, hours }) => [key, hours[hour]])),
  }));
  return (
    <ChartStack>
      <HourGrid>
        <HourGridHeader stats={['Trains', 'Hours every 30 min']} />
        {directions.map(({ key, label, hours, trips, hoursAtTarget }) => (
          <HourGridRow
            key={key}
            label={label}
            hours={hours}
            describe={(hour, trains) =>
              `${label}, ${formatHour(hour)}: ${(trains ?? 0).toFixed(1)} trains on an average ${dayLabel}`
            }
            stats={[formatCount(trips), `${formatCount(hoursAtTarget)}/${SPAN_HOURS}`]}
          />
        ))}
        <HourGridLegend>
          <span>Regional Rail runs a train at least every 30 minutes, from 5am to 1am</span>
        </HourGridLegend>
      </HourGrid>
      {stats && (
        <StatStripGrid>
          <StatCell label="Trains / day">{formatCount(stats.tripsPerDay)}</StatCell>
          <StatCell
            label="Reverse-peak trains"
            description="Trains running away from Boston in the morning rush or toward it in the evening rush"
          >
            {formatCount(stats.reversePeakTrips)}
          </StatCell>
          <StatCell
            label="Longest evening wait"
            description="Longest gap between trains from 7pm to midnight, in the weaker direction"
          >
            {formatMinutes(stats.maxGapEvening)}
          </StatCell>
          <StatCell
            label="Clock-face trains"
            description="Share of trains with another exactly an hour before or after, a pattern riders can memorize"
          >
            {formatShare(stats.clockFaceShare)}
          </StatCell>
        </StatStripGrid>
      )}
      <ChartActions
        datasetName="cr-service-pattern"
        csv={csv}
        startDate={startDate}
        endDate={endDate}
      />
    </ChartStack>
  );
};
