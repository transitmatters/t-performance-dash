import dayjs from 'dayjs';
import React from 'react';

import { useSlowzoneDelayTotalData } from '../../common/api/hooks/slowzones';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { WidgetTitle } from '../dashboard/WidgetTitle';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { TotalSlowTime } from './charts/TotalSlowTime';

interface SystemSlowZonesDetailsProps {
  showTitle?: boolean;
}

export const SystemSlowZonesDetails: React.FC<SystemSlowZonesDetailsProps> = ({
  showTitle = false,
}) => {
  const delayTotals = useSlowzoneDelayTotalData();
  const {
    query: { startDate, endDate },
  } = useDelimitatedRoute();

  const startDateUTC = startDate ? dayjs.utc(startDate).startOf('day') : undefined;
  const endDateUTC = endDate ? dayjs.utc(endDate).startOf('day') : undefined;

  const totalSlowTimeReady = !delayTotals.isError && delayTotals.data && startDateUTC && endDateUTC;

  return (
    <PageWrapper pageTitle={'Slow Zones'}>
      <div className="flex flex-col gap-4">
        <WidgetDiv>
          <WidgetTitle title="Total Slow Time" />
          <div className="relative flex flex-col">
            {totalSlowTimeReady ? (
              <div className="relative flex h-60">
                <TotalSlowTime
                  data={delayTotals.data}
                  startDateUTC={startDateUTC}
                  endDateUTC={endDateUTC}
                  showTitle={showTitle}
                />
              </div>
            ) : (
              <div className="relative flex h-full">
                <ChartPlaceHolder query={delayTotals} />
              </div>
            )}
          </div>
        </WidgetDiv>
      </div>
    </PageWrapper>
  );
};
