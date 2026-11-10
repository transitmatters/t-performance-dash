import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { startCase } from '@lodash-utils';
import { Widget } from '../../common/components/widgets';
import { InfoTooltip } from '../../common/components/general/InfoTooltip';
import { rtStations } from '../../common/constants/stations';
import { useChartToggle } from '../../common/hooks/useChartToggle';
import type { ReliabilityEntry } from '../../common/types/dataPoints';
import type { Line, LineShort } from '../../common/types/lines';
import type { AggType } from '../speed/constants/speeds';
import { HeadwayBreakdown } from './charts/HeadwayBreakdown';
import { OffScheduleDivergingBars } from './charts/OffScheduleDivergingBars';
import { OnTimeBars } from './charts/OnTimeBars';
import { periodName } from './charts/timeAxis';
import type { HeadwayDirection } from './utils';
import { getHeadwayTotals, toHeadwayRows } from './utils';

interface HeadwayReliabilityProps {
  reliability: UseQueryResult<ReliabilityEntry[]>;
  line: Line;
  lineShort: LineShort;
  agg: AggType;
  startDate?: string;
  endDate?: string;
}

/** stations.json keys directions the other way round from GTFS direction_id. */
const directionName = (lineShort: LineShort, directionId: '0' | '1') => {
  const names = rtStations[lineShort as keyof typeof rtStations]?.direction;
  return startCase(names?.[directionId === '0' ? '1' : '0'] ?? `Direction ${directionId}`);
};

const TitleWithInfo = ({ title, info }: { title: string; info: string }) => (
  <span className="inline-flex items-center gap-2">
    {title}
    <InfoTooltip info={info} className="leading-none text-muted-foreground" />
  </span>
);

/** Headway reliability for a subway line or bus route. Only subway counts are split by direction. */
export const HeadwayReliability = ({
  reliability,
  line,
  lineShort,
  agg,
  startDate,
  endDate,
}: HeadwayReliabilityProps) => {
  const isBus = line === 'line-bus';
  const vehicle = isBus ? 'bus' : 'train';
  const period = periodName(agg);

  const { value: direction, control: directionControl } = useChartToggle<HeadwayDirection, string>(
    'both',
    [
      ['both', 'Both directions'],
      ['0', directionName(lineShort, '0')],
      ['1', directionName(lineShort, '1')],
    ],
    { variant: 'toggle', paramKey: 'relDir' }
  );
  // Bus counts aren't split by direction
  const shownDirection = isBus ? 'both' : direction;
  const rows = toHeadwayRows(reliability.data ?? [], shownDirection);
  const ready = [reliability, startDate, endDate];

  if (!startDate || !endDate) return null;
  const chartProps = { rows, agg, startDate, endDate };

  const card = (
    title: string,
    info: string,
    subtitle: string,
    chart: ReactNode,
    action?: ReactNode
  ) => (
    <Widget
      title={<TitleWithInfo title={title} info={info} />}
      subtitle={subtitle}
      ready={ready}
      action={action}
    >
      {chart}
    </Widget>
  );

  return (
    <>
      {card(
        'How reliable was service',
        `A headway is the gap between one ${vehicle} and the next. Each is compared with the scheduled headway at that time: on time is within 25% of it (with a ${vehicle} every 8 minutes, a gap of 6 to 10 minutes), bunched is half of it or less, and a long gap is half again as long or more.`,
        'Every headway in these dates, compared with the scheduled headway',
        <HeadwayBreakdown counts={getHeadwayTotals(rows)} />,
        !isBus && directionControl
      )}
      {card(
        'On time over time',
        `The share of headways within 25% of the scheduled headway. This is the measure the home page judges each line on.`,
        `Share of headways on time, per ${period}`,
        <OnTimeBars {...chartProps} />
      )}
      {card(
        'Bunching or long gaps',
        `Long gaps mean longer waits. Bunching often follows them, as the next ${vehicle} catches up to the late one, so the two tend to rise together.`,
        `Each ${period}: headways longer than scheduled above the line, shorter (bunching) below it`,
        <OffScheduleDivergingBars {...chartProps} />
      )}
    </>
  );
};
