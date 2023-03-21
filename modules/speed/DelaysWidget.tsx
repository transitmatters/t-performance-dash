import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { useMemo } from 'react';
import { fetchLineTraversalTimes } from '../../common/api/speed';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { MPHWidgetValue } from '../../common/types/basicWidgets';
import { TimeRange } from '../../common/types/inputs';
import { useDelimitatedRoute } from '../../common/utils/router';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { CORE_TRACK_LENGTHS, DELAYS_RANGE_PARAMS_MAP } from './constants/delays';
import { Delays } from './Delays';

interface DelaysWidgetProps {
  timeRange: TimeRange;
}

export const DelaysWidget: React.FC<DelaysWidgetProps> = ({ timeRange }) => {
  const { line, linePath } = useDelimitatedRoute();
  const { agg, endDate, startDate, comparisonStartDate, comparisonEndDate } =
    DELAYS_RANGE_PARAMS_MAP[timeRange];

  const medianTravelTimes = useQuery(
    ['traversal', line, startDate, endDate, agg],
    () => fetchLineTraversalTimes({ start_date: startDate, end_date: endDate, agg, line }),
    { enabled: line != undefined }
  );
  const compTravelTimes = useQuery(
    ['traversalComparison', line, comparisonStartDate, startDate, agg],
    () =>
      fetchLineTraversalTimes({
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
    if (medianTravelTimes.data == undefined || compTravelTimes.data == undefined) {
      return { average: undefined, delta: undefined };
    }
    const values = medianTravelTimes.data.map(
      (datapoint) => CORE_TRACK_LENGTHS[line ?? 'DEFAULT'] / (datapoint.value / 3600)
    );
    const compValues = compTravelTimes.data.map(
      (datapoint) => CORE_TRACK_LENGTHS[line ?? 'DEFAULT'] / (datapoint.value / 3600)
    );

    const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const compAverage = compValues?.reduce((a, b) => a + b, 0) / compValues?.length;
    const delta = average - compAverage;
    return { average, delta };
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
        <Delays timeRange={timeRange} data={medianTravelTimes.data ?? []} />
      </div>
    </>
  );
};
