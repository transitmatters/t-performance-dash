import type { ReactNode } from 'react';
import { useExcessTripTimeData } from '../../common/api/hooks/reliability';
import { Widget } from '../../common/components/widgets';
import { StatCard, StatCardGrid } from '../../common/components/widgets/StatCard';
import { TitleWithInfo } from '../../common/components/general/InfoTooltip';
import { useReliabilityDirection } from '../../common/hooks/usePageFilters';
import { LINE_COLORS } from '../../common/constants/colors';
import type { Line } from '../../common/types/lines';
import type { AggType } from '../speed/constants/speeds';
import { ExcessTimeBars } from './charts/ExcessTimeBars';
import { ReliabilityGraph } from './charts/ReliabilityGraph';
import { periodName } from './charts/timeAxis';
import {
  excessTravel,
  excessTripTime,
  excessWait,
  formatMinutes,
  PERIODS,
  sumEttRows,
  toEttRows,
  withinFiveShare,
  withinTwentyShare,
} from './excessTripTime';
import { formatCount, formatPercent, toPoints } from './utils';

interface ExcessTripTimeProps {
  line: Line;
  agg: AggType;
  startDate?: string;
  endDate?: string;
}

/** The MBTA's own subway reliability measure, for the lines it publishes it for. */
export const ExcessTripTime = ({ line, agg, startDate, endDate }: ExcessTripTimeProps) => {
  const { value: direction } = useReliabilityDirection();
  const ett = useExcessTripTimeData(
    { line, start_date: startDate, end_date: endDate, agg },
    Boolean(startDate && endDate)
  );
  const rows = toEttRows(ett.data ?? [], direction);
  const totals = sumEttRows(rows);
  const ready = [ett, startDate, endDate];
  const period = periodName(agg);
  // No period is the headline, so none is filled. The two peaks are the line's color and a light
  // tint of it (the line's darker shade is too close to tell apart), and off-peak keeps the gray.
  const periodStyles = {
    amPeak: { fill: false },
    pmPeak: { color: `${LINE_COLORS[line]}80` },
    offPeak: undefined,
  };

  if (!startDate || !endDate) return null;
  const graphProps = { line, agg, startDate, endDate, kind: 'percent' as const };

  const card = (title: string, info: string, subtitle: string, chart: ReactNode) => (
    <Widget title={<TitleWithInfo title={title} info={info} />} subtitle={subtitle} ready={ready}>
      {chart}
    </Widget>
  );

  return (
    <>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-foreground">Excess trip time</h2>
        <p className="text-sm text-muted-foreground">
          How much longer riders&apos; trips took than the MBTA&apos;s baseline, from its fare and
          train data. The MBTA publishes it monthly, about five weeks behind.
        </p>
      </div>
      {ett.data && (
        <StatCardGrid>
          <StatCard label="Riders within 5 min" value={formatPercent(withinFiveShare(totals))} />
          <StatCard label="Riders within 20 min" value={formatPercent(withinTwentyShare(totals))} />
          <StatCard
            label="Riders per day"
            value={formatCount(totals.days ? totals.riders / totals.days : undefined)}
          />
          <StatCard
            label="Excess trip time"
            value={formatMinutes(excessTripTime(totals))}
            unit="min per rider"
          />
          <StatCard label="Excess wait" value={formatMinutes(excessWait(totals))} unit="min" />
          <StatCard label="Excess travel" value={formatMinutes(excessTravel(totals))} unit="min" />
        </StatCardGrid>
      )}
      {card(
        'Trips within 5 minutes of the baseline',
        "The MBTA's reliability standard for the subway: the share of riders whose trip, waiting plus riding, took at most 5 minutes longer than the baseline. The baseline is the fastest the trip has run in a typical month since 2021, with the wait the best schedule allows, so it's a stretch rather than the timetable.",
        `Share of riders, per ${period}`,
        <ReliabilityGraph
          {...graphProps}
          data={[
            { label: 'Within 5 min', data: toPoints(rows, (row) => withinFiveShare(row.sums)) },
            { label: 'Within 20 min', data: toPoints(rows, (row) => withinTwentyShare(row.sums)) },
          ]}
          valueAxisLabel="Riders"
        />
      )}
      {card(
        'Peak and off-peak',
        "Peak is weekdays 7–9am and 4–6:30pm, as the MBTA's Service Delivery Policy defines it. Weekends and holidays are off-peak.",
        `Share of riders within 5 minutes of the baseline, per ${period}`,
        <ReliabilityGraph
          {...graphProps}
          data={PERIODS.map(({ key, label }) => ({
            label,
            data: toPoints(rows, (row) => withinFiveShare(row.sums?.byPeriod[key])),
            style: periodStyles[key],
          }))}
          valueAxisLabel="Riders within 5 min"
        />
      )}
      {card(
        'Where the extra time comes from',
        'Excess wait comes from gaps between trains: a wait is taken as half the gap a rider arrived in, so long gaps count for more. Excess travel is time on board beyond the baseline, from slow zones and long dwells. Either can drop below zero when trains do better than the baseline.',
        `Minutes per rider over the baseline, per ${period}`,
        <ExcessTimeBars rows={rows} line={line} agg={agg} startDate={startDate} endDate={endDate} />
      )}
    </>
  );
};
