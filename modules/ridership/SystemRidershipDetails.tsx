import React from 'react';
import { useDelimitatedRoute } from '../../common/utils/router';
import { useRidershipData } from '../../common/api/hooks/ridership';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { Widget } from '../../common/components/widgets';
import { SPEED_RANGE_PARAM_MAP } from '../speed/constants/speeds';
import { RidershipGraphWrapper } from './RidershipGraphWrapper';

export function SystemRidershipDetails() {
  const {
    query: { startDate, endDate },
  } = useDelimitatedRoute();
  const config = SPEED_RANGE_PARAM_MAP.week;
  const enabled = Boolean(startDate && endDate);

  const ridership = useRidershipData(
    {
      start_date: startDate,
      end_date: endDate,
    },
    enabled
  );

  return (
    <ChartPageDiv>
      <Widget title="Weekday ridership" ready={[ridership, startDate, endDate]}>
        <RidershipGraphWrapper
          data={ridership.data!}
          config={config}
          startDate={startDate!}
          endDate={endDate!}
        />
      </Widget>
    </ChartPageDiv>
  );
}
