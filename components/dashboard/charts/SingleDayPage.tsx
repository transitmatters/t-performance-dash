import { SingleDayLineChart } from './SingleDayLineChart'

import { BenchmarkFieldKeys, MetricFieldKeys, PointFieldKeys } from '../../../src/charts/types';
import { stopIdsForStations } from '../../../utils/stations';
import { fetchSingleDayData } from '../../../api/datadashboard';
import { useQuery } from '@tanstack/react-query';

// TODO: add types
export const SingleDayPage = ({configuration}) => {
  const { fromStation, toStation, dateSelection} = configuration;
  const date = dateSelection?.startDate;
  const {fromStopIds, toStopIds } = stopIdsForStations(fromStation?.value, toStation?.value);
  const queryReady = !!(fromStopIds && date);

  //TODO: deal with errors
  const headwaysRequest = useQuery({enabled: queryReady, queryKey: ['headways', fromStopIds, date], queryFn: () => fetchSingleDayData('headways', date, {stop: fromStopIds}) });
  const traveltimesRequest = useQuery({enabled: queryReady, queryKey: ['traveltimes', fromStopIds, toStopIds, date], queryFn: () => fetchSingleDayData('traveltimes', date, {from_stop: fromStopIds, to_stop: toStopIds}) });
  const dwellsRequest = useQuery({enabled: queryReady, queryKey: ['dwells', fromStopIds, date], queryFn: () => fetchSingleDayData('dwells', date, {stop: fromStopIds}) });
  if(!(queryReady)) {
    //TODO: Add something nice here when no charts are loaded.
    return (<p> select values to load charts.</p>)
  }
    return (
        <div>
            <div className={'charts main-column'}>
              <SingleDayLineChart
                chartId={'traveltimes'}
                title={'Travel Times'}
                data={traveltimesRequest.data || []}
                metricField={MetricFieldKeys.travelTimeSec}
                benchmarkField={BenchmarkFieldKeys.benchmarkTravelTimeSec}
                pointField={PointFieldKeys.depDt}
                bothStops={true}
                location={'todo'}
                isLoading={traveltimesRequest.isLoading}
                fname={'todo'}
              />
            </div>

            <div className={'charts main-column'}>
              <SingleDayLineChart
                chartId={'headways'}
                title={'Time between trains (headways)'}
                data={headwaysRequest.data || []}
                metricField={MetricFieldKeys.headWayTimeSec}
                benchmarkField={BenchmarkFieldKeys.benchmarkHeadwayTimeSec}
                pointField={PointFieldKeys.currentDepDt}
                location={'todo'}
                isLoading={headwaysRequest.isLoading}
                fname={'todo'}
              />
            </div>
            <div className={'charts main-column'}>
              <SingleDayLineChart
                chartId={'dwells'}
                title={'Time spent at station (dwells)'}
                data={dwellsRequest.data || []}
                metricField={MetricFieldKeys.dwellTimeSec}
                pointField={PointFieldKeys.arrDt}
                location={'todo'}
                isLoading={dwellsRequest.isLoading}
                fname={'todo'}
              />
            </div>
          </div>
    )

}