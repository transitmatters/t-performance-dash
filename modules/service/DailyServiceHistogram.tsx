import React, { useMemo } from 'react';

import type { DayKind, ScheduledService } from '../../common/types/dataPoints';
import { ByHourHistogram } from '../../common/components/charts/ByHourHistogram';
import { useDelimitatedRoute } from '../../common/utils/router';
import { prettyDate } from '../../common/utils/date';
import { CarouselGraphDiv } from '../../common/components/charts/CarouselGraphDiv';

interface Props {
  scheduledService: ScheduledService;
  dayKind: DayKind;
}

export const DailyServiceHistogram: React.FC<Props> = (props) => {
  const { scheduledService, dayKind } = props;
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

  return (
    <>
      <CarouselGraphDiv>
        <ByHourHistogram
          data={data}
          style={{ color }}
          valueAxis={{ title: 'Scheduled round trips', tooltipItemLabel: 'round trips' }}
          datasetRoundTrips
        />
      </CarouselGraphDiv>
    </>
  );
};
