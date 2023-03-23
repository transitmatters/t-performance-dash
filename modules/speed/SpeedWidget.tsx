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

  const medianTravelTimes = useQuery(
    ['traversal', line, startDate, endDate, agg],
    () => fetchSpeeds({ start_date: startDate, end_date: endDate, agg, line }),
    { enabled: line != undefined }
  );
  const compTravelTimes = useQuery(
    ['traversalComparison', line, comparisonStartDate, startDate, agg],
    () =>
      fetchSpeeds({
        start_date: comparisonStartDate,
        end_date: comparisonEndDate,
        agg,
        line,
      }),
    { enabled: line != undefined }
  );

  if (medianTravelTimes.isError) {
    return <div>Error</div>;
  }

  const { average, delta } = useMemo(() => {
    return getSpeedWidgetValues(medianTravelTimes, compTravelTimes, line);
  }, [medianTravelTimes.data, compTravelTimes.data]);

  return (
    <>
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <HomescreenWidgetTitle title="Travel Times" href={`/${linePath}/traveltimes`} />
        <div className={classNames('space-between flex w-full flex-row')}>
          <BasicWidgetDataLayout
            title="Average Speed"
            widgetValue={new MPHWidgetValue(average ?? undefined, delta)}
            analysis={`from prev. ${timeRange}`}
            sentimentDirection={'positiveOnIncrease'}
          />
        </div>
        <SpeedGraph timeRange={timeRange} data={medianTravelTimes.data ?? []} />
      </div>
    </>
  );
};
