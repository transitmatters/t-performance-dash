import { SingleDayLineChart } from './SingleDayLineChart'
import { BenchmarkFieldKeys, MetricFieldKeys, PointFieldKeys } from '../../../src/charts/types';
import { stopIdsForStations } from '../../../utils/stations';
import { fetchSingleDayData } from '../../../api/datadashboard';
import { useQuery } from '@tanstack/react-query';
import { Station } from '../../../types/stations';
import { DateOption } from '../../../types/inputs';


interface SingleDayPageProps {
  configuration: {
    fromStation: Station,
    toStation: Station,
    dateSelection: DateOption | null,
  }
}

export const SingleDayPage: React.FC<SingleDayPageProps> = ({configuration}) => {
  const { fromStation, toStation, dateSelection} = configuration;
  const {fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
  const date = dateSelection?.startDate;
  const queryReady = !!(fromStopIds && date);

  //TODO: deal with errors
  const headwaysRequest = useQuery({
    refetchOnWindowFocus: false,
    enabled: queryReady,
    queryKey: ['headways', fromStopIds, date],
    queryFn: () => fetchSingleDayData('headways', {stop: fromStopIds}, date)
  });
  const traveltimesRequest = useQuery({
    refetchOnWindowFocus: false,
    enabled: queryReady,
    queryKey: ['traveltimes', fromStopIds, toStopIds, date],
    queryFn: () => fetchSingleDayData('traveltimes', {from_stop: fromStopIds, to_stop: toStopIds}, date)
  });
  const dwellsRequest = useQuery({
    refetchOnWindowFocus: false,
    enabled: queryReady,
    queryKey: ['dwells', fromStopIds, date],
    queryFn: () => fetchSingleDayData('dwells', {stop: fromStopIds}, date) 
  });

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
                date={date}
                metricField={MetricFieldKeys.travelTimeSec}
                pointField={PointFieldKeys.depDt}
                benchmarkField={BenchmarkFieldKeys.benchmarkTravelTimeSec}
                isLoading={traveltimesRequest.isLoading}
                bothStops={true}
                location={'todo'}
                fname={'todo'}
              />
            </div>

            <div className={'charts main-column'}>
              <SingleDayLineChart
                chartId={'headways'}
                title={'Time between trains (headways)'}
                data={headwaysRequest.data || []}
                date={date}
                metricField={MetricFieldKeys.headWayTimeSec}
                pointField={PointFieldKeys.currentDepDt}
                benchmarkField={BenchmarkFieldKeys.benchmarkHeadwayTimeSec}
                isLoading={headwaysRequest.isLoading}
                location={'todo'}
                fname={'todo'}
              />
            </div>
            <div className={'charts main-column'}>
              <SingleDayLineChart
                chartId={'dwells'}
                title={'Time spent at station (dwells)'}
                data={dwellsRequest.data || []}
                date={date}
                metricField={MetricFieldKeys.dwellTimeSec}
                pointField={PointFieldKeys.arrDt}
                isLoading={dwellsRequest.isLoading}
                location={'todo'}
                fname={'todo'}
              />
            </div>
          </div>
    )

}