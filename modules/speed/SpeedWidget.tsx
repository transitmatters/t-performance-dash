import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { fetchSpeeds } from '../../common/api/speed';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { MPHWidgetValue } from '../../common/types/basicWidgets';
import { TimeRange } from '../../common/types/inputs';
import { useDelimitatedRoute } from '../../common/utils/router';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { DELAYS_RANGE_PARAMS_MAP } from './constants/speeds';
import { SpeedGraph } from './SpeedGraph';
import { getSpeedWidgetValues } from './utils/utils';

interface SpeedWidgetProps {
  timeRange: TimeRange;
}

export const SpeedWidget: React.FC<SpeedWidgetProps> = ({ timeRange }) => {
  const { line, linePath } = useDelimitatedRoute();
  const { agg, endDate, startDate, comparisonStartDate, comparisonEndDate } =
    DELAYS_RANGE_PARAMS_MAP[timeRange];

  const speeds = useQuery(
    ['speed', line, startDate, endDate, agg],
    () => fetchSpeeds({ start_date: startDate, end_date: endDate, agg, line }),
    { enabled: line != undefined }
  );
  const compSpeeds = useQuery(
    ['speedComparison', line, comparisonStartDate, startDate, agg],
    () =>
      fetchSpeeds({
        start_date: comparisonStartDate,
        end_date: comparisonEndDate,
        agg,
        line,
      }),
    { enabled: line != undefined }
  );

  const { average, delta } = useMemo(() => {
    return getSpeedWidgetValues(speeds, compSpeeds, line);
  }, [speeds.data, compSpeeds.data]);

  if (speeds.isError) {
    return <div>Error</div>;
  }

  return (
    <>
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <HomescreenWidgetTitle title="Speed" href={`/${linePath}/speed`} />
        <div className={classNames('space-between flex w-full flex-row')}>
          <BasicWidgetDataLayout
            title="Average Speed"
            widgetValue={new MPHWidgetValue(average ?? undefined, delta)}
            analysis={`from prev. ${timeRange}`}
            sentimentDirection={'positiveOnIncrease'}
          />
        </div>
        <div className={classNames('h-60 pr-4')}>
          <SpeedGraph timeRange={timeRange} data={speeds.data ?? []} />
        </div>
      </div>
    </>
  );
};
