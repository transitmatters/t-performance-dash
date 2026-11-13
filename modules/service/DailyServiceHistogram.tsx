import { useMemo, useRef } from 'react';

import type { DayKind, ScheduledService } from '../../common/types/dataPoints';
import { ByHourHistogram } from '../../common/components/charts/ByHourHistogram';
import { useDelimitatedRoute } from '../../common/utils/router';
import { prettyDate } from '../../common/utils/date';
import { ChartStack } from '../../common/components/charts/ChartStack';
import { ChartActions } from '../../common/components/charts/ChartActions';
import { ServiceEmbedButton } from './ServiceEmbedButton';

interface Props {
  scheduledService: ScheduledService;
  dayKind: DayKind;
  /** Fill the parent's height, as an embed does. */
  fill?: boolean;
}

const DAY_KIND_NAMES: Record<DayKind, string> = {
  weekday: 'weekday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export const DailyServiceHistogram = (props: Props) => {
  const { scheduledService, dayKind, fill = false } = props;
  const { color } = useDelimitatedRoute();
  const ref = useRef(null);

  const compared = useMemo(() => {
    const start = scheduledService.start_date_service_levels?.[dayKind];
    const end = scheduledService.end_date_service_levels?.[dayKind];
    // The range has no day of this kind, e.g. Saturday on a Monday–Thursday range.
    if (!start?.service_levels || !end?.service_levels) return null;
    const { date: startDate, service_levels: startServiceLevels } = start;
    const { date: endDate, service_levels: endServiceLevels } = end;
    const data = [
      {
        label: prettyDate(startDate),
        data: startServiceLevels.map((value) => value / 2),
        style: { opacity: 0.5 },
      },
      {
        label: prettyDate(endDate),
        data: endServiceLevels.map((value) => value / 2),
      },
    ];
    return { data, startDate, endDate };
  }, [scheduledService, dayKind]);

  const histogram = compared ? (
    <ByHourHistogram
      data={compared.data}
      style={{ color }}
      valueAxis={{ title: 'Scheduled round trips', tooltipItemLabel: 'round trips' }}
      datasetRoundTrips
      compareDatasets
      fill={fill}
      chartRef={ref}
    />
  ) : (
    <p className="flex h-40 items-center justify-center text-sm text-muted-foreground">
      No {DAY_KIND_NAMES[dayKind]} service in these dates.
    </p>
  );
  if (fill) return <ChartStack className="h-full">{histogram}</ChartStack>;
  return (
    <ChartStack>
      {histogram}
      <ChartActions
        datasetName="service-by-hour"
        chartRef={ref}
        startDate={compared?.startDate}
        endDate={compared?.endDate}
        embed={<ServiceEmbedButton chart="by-hour" />}
      />
    </ChartStack>
  );
};
