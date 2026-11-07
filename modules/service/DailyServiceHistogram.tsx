import { useMemo } from 'react';

import type { DayKind, ScheduledService } from '../../common/types/dataPoints';
import { ByHourHistogram } from '../../common/components/charts/ByHourHistogram';
import { useDelimitatedRoute } from '../../common/utils/router';
import { prettyDate } from '../../common/utils/date';
import { ChartStack } from '../../common/components/charts/ChartStack';
import { ServiceEmbedButton } from './ServiceEmbedButton';

interface Props {
  scheduledService: ScheduledService;
  dayKind: DayKind;
  /** Fill the parent's height and leave out the Embed button, as an embed does. */
  fill?: boolean;
}

export const DailyServiceHistogram = (props: Props) => {
  const { scheduledService, dayKind, fill = false } = props;
  const { color } = useDelimitatedRoute();

  const data = useMemo(() => {
    const {
      start_date_service_levels: {
        [dayKind]: { date: startDate, service_levels: startServiceLevels },
      },
      end_date_service_levels: {
        [dayKind]: { date: endDate, service_levels: endServiceLevels },
      },
    } = scheduledService;
    return [
      {
        label: prettyDate(startDate),
        data: startServiceLevels!.map((value) => value / 2),
        style: { opacity: 0.5 },
      },
      {
        label: prettyDate(endDate),
        data: endServiceLevels!.map((value) => value / 2),
      },
    ];
  }, [scheduledService, dayKind]);

  const histogram = (
    <ByHourHistogram
      data={data}
      style={{ color }}
      valueAxis={{ title: 'Scheduled round trips', tooltipItemLabel: 'round trips' }}
      datasetRoundTrips
      compareDatasets
    />
  );
  if (fill)
    return (
      <ChartStack className="h-full">
        <div className="relative min-h-0 flex-1">{histogram}</div>
      </ChartStack>
    );
  return (
    <ChartStack>
      {histogram}
      <div className="flex flex-row items-end justify-end gap-4">
        <ServiceEmbedButton chart="by-hour" />
      </div>
    </ChartStack>
  );
};
