import { AggregateLineChart } from "./AggregateLineChart";

import dwellsDataAgg from '../../../data/dwells_agg.json';
import headwaysDataAgg from '../../../data/headways_agg.json';
import travelTimesDataAgg from '../../../data/travel_times_agg.json';
import { PointFieldKeys } from "../../../src/charts/types";
import { DateOption } from "../../../types/inputs";
import { CHART_COLORS } from "../../../utils/constants";

interface AggregatePageProps {
    dateSelection: DateOption,
}
/*
TODOS: 
 timeFormat is not set up to display week day correctly
 isLoading field
 location field
 Toggle for peak data only
 bus_mode
*/

export const AggregatePage: React.FC<AggregatePageProps> = ({ dateSelection }) => {
    return (
        <div>
            <div className={'charts main-column'}>
                <AggregateLineChart
                    chartId={'travel_times_agg'}
                    title={'Travel times'}
                    data={travelTimesDataAgg['by_date']?.filter(x => x.peak === 'all') || []}
                    // This is service date when agg by date. dep_time_from_epoch when agg by hour. Can probably remove this prop.
                    pointField={PointFieldKeys.serviceDate}
                    timeUnit={'day'}
                    timeFormat={'MMM d yyyy'}
                    seriesName='Median travel time'
                    startDate={dateSelection?.startDate}
                    endDate={dateSelection?.endDate}
                    fillColor={CHART_COLORS.FILL}
                    location={'todo'}
                    isLoading={false}
                    bothStops={true}
                    fname="traveltimes"
                />
            </div>
            <div className={'charts main-column'}>
                <AggregateLineChart
                    chartId={'headways_agg'}
                    title={'Time between trains (headways)'}
                    data={headwaysDataAgg}
                    pointField={PointFieldKeys.serviceDate}
                    timeUnit={'day'}
                    timeFormat={'MMM d yyyy'}
                    seriesName='Median headway'
                    startDate={dateSelection?.startDate}
                    endDate={dateSelection?.endDate}
                    fillColor={CHART_COLORS.FILL}
                    location={'todo'}
                    isLoading={false}
                    fname="headways"
                />
            </div>
            { // TODO: Make this only appear when not on bus lines.
                // !bus_mode &&  
                <div className={'charts main-column'}>
                    <AggregateLineChart
                        chartId={'dwells_agg'}
                        title={'Time spent at stations (dwells)'}
                        data={dwellsDataAgg}
                        pointField={PointFieldKeys.serviceDate}
                        timeUnit={'day'}
                        timeFormat={'MMM d yyyy'}
                        seriesName='Median dwell time'
                        startDate={dateSelection?.startDate}
                        endDate={dateSelection?.endDate}
                        fillColor={CHART_COLORS.FILL}
                        location={'todo'}
                        isLoading={false}
                        fname="dwells"
                    />
                </div>
            }
            <div className={'charts main-column'}>
                <AggregateLineChart
                    chartId={'dwells_agg'}
                    title={'Travel times by hour'}
                    data={travelTimesDataAgg['by_time'].filter(data => data.is_peak_day)} // TODO: Add toggle for this.
                    pointField={PointFieldKeys.depTimeFromEpoch}
                    timeUnit={'hour'}
                    timeFormat='hh:mm a'
                    seriesName='Median travel time'
                    startDate={dateSelection?.startDate}
                    endDate={dateSelection?.endDate}
                    fillColor={CHART_COLORS.FILL_HOURLY}
                    location={'todo'}
                    isLoading={false}
                    bothStops={true}
                    fname="traveltimesByHour"
                />
            </div>
        </div>
    );
}