import React, { useMemo, useState } from 'react';

import type { DayKind, ScheduledService } from '../../common/types/dataPoints';
import { ByHourHistogram } from '../../common/components/charts/ByHourHistogram';
import { useDelimitatedRoute } from '../../common/utils/router';
import { prettyDate } from '../../common/utils/date';
import { ButtonGroup } from '../../common/components/general/ButtonGroup';

interface Props {
  scheduledService: ScheduledService;
}

export const DailyServiceHistogram: React.FC<Props> = (props) => {
  const { scheduledService } = props;
  const [dayKind, setDayKind] = useState<DayKind>('weekday');
  const { color, line } = useDelimitatedRoute();

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
        data: startServiceLevels!,
        style: { opacity: 0.5 },
      },
      {
        label: prettyDate(endDate),
        data: endServiceLevels!,
      },
    ];
  }, [scheduledService, dayKind]);

  return (
    <>
      <ByHourHistogram
        data={data}
        style={{ color }}
        valueAxis={{ title: 'Scheduled round trips', tooltipItemLabel: 'round trips' }}
      />
      <div className={'flex w-full justify-center pt-2'}>
        <ButtonGroup
          line={line}
          pressFunction={setDayKind}
          options={[
            ['weekday', 'Weekday'],
            ['saturday', 'Saturday'],
            ['sunday', 'Sunday'],
          ]}
          additionalDivClass="md:w-auto"
          additionalButtonClass="md:w-fit"
        />
      </div>
    </>
  );
};
