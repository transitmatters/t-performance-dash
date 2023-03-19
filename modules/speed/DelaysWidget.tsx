import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { fetchLineTraversalTimes } from '../../common/api/speed';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { PercentageWidgetValue, TimeWidgetValue } from '../../common/types/basicWidgets';
import { useDelimitatedRoute } from '../../common/utils/router';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { TimeRange } from '../dashboard/LineHealth';
import { DELAYS_RANGE_PARAMS_MAP, MINIMUMS } from './constants/delays';
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
  const comparisonTravelTimes = useQuery(
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

  const data = medianTravelTimes?.data ?? [];
  const min = MINIMUMS[line ?? 'DEFAULT'];
  const values = data.map((datapoint) => datapoint.value / min - 1);
  const average = values?.reduce((a, b) => a + b, 0) / values.length;

  const comparisonValues = comparisonTravelTimes?.data?.map(
    (datapoint) => datapoint.value / min - 1
  );
  const comparisonAverage = comparisonValues?.reduce((a, b) => a + b, 0) / comparisonValues?.length;
  const delta = average - comparisonAverage;
  return (
    <>
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <HomescreenWidgetTitle title="Travel Times" href={`/${linePath}/traveltimes`} />
        <div className={classNames('space-between flex w-full flex-row')}>
          <BasicWidgetDataLayout
            title="Average Delay"
            widgetValue={new PercentageWidgetValue(average ?? undefined, delta)}
            analysis={`from prev. ${timeRange}`}
          />
          <BasicWidgetDataLayout
            title="TBD"
            widgetValue={new TimeWidgetValue(0, 0)}
            analysis={`from prev. ${timeRange}`}
          />
        </div>
        <Delays timeRange={timeRange} data={data} />
      </div>
    </>
  );
};
