import { SingleDayLineChart } from './SingleDayLineChart'

import dwellsData from '../../../data/dwells.json';
import headwaysData from '../../../data/headways.json';
import travelTimesData from '../../../data/travel_times.json';
import { BenchmarkFieldKeys, MetricFieldKeys, PointFieldKeys } from '../../../src/charts/types';

export const SingleDayPage = () => {
    return (
        <div>
            <div className={'charts main-column'}>
              <SingleDayLineChart
                chartId={'travelTimes'}
                title={'Travel Times'}
                data={travelTimesData}
                metricField={MetricFieldKeys.travelTimeSec}
                benchmarkField={BenchmarkFieldKeys.benchmarkTravelTimeSec}
                pointField={PointFieldKeys.depDt}
                bothStops={true}
                location={'todo'}
                isLoading={false}
                fname={'todo'}
              />
            </div>

            <div className={'charts main-column'}>
              <SingleDayLineChart
                chartId={'headways'}
                title={'Time between trains (headways)'}
                data={headwaysData}
                metricField={MetricFieldKeys.headWayTimeSec}
                benchmarkField={BenchmarkFieldKeys.benchmarkHeadwayTimeSec}
                pointField={PointFieldKeys.currentDepDt}
                location={'todo'}
                isLoading={false}
                fname={'todo'}
              />
            </div>
            <div className={'charts main-column'}>
              <SingleDayLineChart
                chartId={'dwells'}
                title={'Time spent at station (dwells)'}
                data={dwellsData}
                metricField={MetricFieldKeys.dwellTimeSec}
                pointField={PointFieldKeys.arrDt}
                location={'todo'}
                isLoading={false}
                fname={'todo'}
              />
            </div>
          </div>
    )

}