'use client';
import React from 'react';
import classNames from 'classnames';
import ArrowDownNegative from '../../public/Icons/ArrowDownNegative.svg';
import { SingleDayLineChart } from '../../common/components/charts/SingleDayLineChart';
import { BenchmarkFieldKeys, MetricFieldKeys, PointFieldKeys } from '../../src/charts/types';
import { SingleDayAPIParams } from '../../common/types/api';
import { stopIdsForStations } from '../../common/utils/stations';
import { useCustomQueries } from '../../common/api/datadashboard';
import type { Station } from '../../common/types/stations';
import { getCurrentDate } from '../../common/utils/date';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';

export const HeadwaysWidget: React.FC = () => {
  const startDate = getCurrentDate();
  const { linePath } = useDelimitatedRoute();

  const fromStation: Station = {
    stop_name: 'Kendall/MIT',
    branches: ['A', 'B'],
    station: 'place-knncl',
    order: 6,
    stops: {
      '0': ['70072'],
      '1': ['70071'],
    },
  };
  const toStation: Station = {
    stop_name: 'Downtown Crossing',
    branches: ['A', 'B'],
    station: 'place-dwnxg',
    order: 9,
    stops: {
      '0': ['70078'],
      '1': ['70077'],
    },
  };

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);

  const { headways } = useCustomQueries(
    {
      [SingleDayAPIParams.fromStop]: fromStopIds || '',
      [SingleDayAPIParams.toStop]: toStopIds || '',
      [SingleDayAPIParams.stop]: fromStopIds || '',
      [SingleDayAPIParams.date]: startDate,
    },
    false
  );

  if (headways.isLoading) {
    return <>Loading ... teehee</>;
  }

  if (headways.isError) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      <HomescreenWidgetTitle title="Headways" href={`/${linePath}/headways`} />
      <div className={classNames('bg-white p-2 shadow-dataBox')}>
        <div className={'charts main-column'}>
          <SingleDayLineChart
            chartId={'headways'}
            title={'Time between trains (headways)'}
            data={headways.data || []}
            date={startDate}
            metricField={MetricFieldKeys.headWayTimeSec}
            pointField={PointFieldKeys.currentDepDt}
            benchmarkField={BenchmarkFieldKeys.benchmarkHeadwayTimeSec}
            isLoading={headways.isLoading}
            location={'todo'}
            fname={'headways'}
          />
        </div>
        <div className={classNames('flex w-full flex-row')}>
          <BasicWidgetDataLayout
            title="Average Headway"
            value={'8'}
            units="min"
            analysis="+1.0 since last week"
            Icon={<ArrowDownNegative className="h-3 w-auto" alt="Your Company" />}
          />
        </div>
      </div>
    </>
  );
};
