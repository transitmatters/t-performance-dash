import React from 'react';
import { AggregateByDateSelectable, AggregateByTimeSelectable } from './SelectableCharts';
import { SingleDayLine, AggregateByDate } from './line';
import { station_direction } from './stations';

const dataFields = {
  traveltimes: {
    seriesName: "travel time",
    xField: "dep_dt",
    yField: "travel_time_sec",
    benchmarkField: "benchmark_travel_time_sec"
  },
  headways: {
    seriesName: "headway",
    xField: "current_dep_dt",
    yField: "headway_time_sec",
    benchmarkField: "benchmark_headway_time_sec"
  },
  dwells: {
    seriesName: "dwell time",
    xField: "arr_dt",
    yField: "dwell_time_sec",
    benchmarkField: null
  }
}

function getLocationDescription(from, to, line) {  
  if (from && to) {
    return {
      to: to.stop_name,
      from: from.stop_name,
      direction: station_direction(from, to, line),
      line: line,
    };
  }
  return {};
}

const AggregateSet = (props) => {
  const locationDescription = getLocationDescription(props.from, props.to, props.line);
  return(
    <div className='charts main-column'>
      {/**
       * Perhaps we want AggregateOverTimeLine still for rail, and only have the peak/offpeak for bus
       * In which case, data={props.traveltimes.overtime.filter(x => x.peak === 'all')}
       */}
      <AggregateByDateSelectable
        title={"Travel times"}
        data={props.traveltimes.by_date || []}
        seriesName={"Median travel time"}
        location={locationDescription}
        titleBothStops={true}
        isLoading={props.isLoadingTraveltimes}
        startDate={props.startDate}
        endDate={props.endDate}
      />
      <AggregateByDate
        title={'Time between trains (headways)'}
        data={props.headways}
        seriesName={'Median headway'}
        location={locationDescription}
        titleBothStops={false}
        isLoading={props.isLoadingHeadways}
        startDate={props.startDate}
        endDate={props.endDate}
      />
      <AggregateByDate
        title={'Time spent at station (dwells)'}
        data={props.dwells}
        seriesName={'Median dwell time'}
        location={locationDescription}
        titleBothStops={false}
        isLoading={props.isLoadingDwells}
        startDate={props.startDate}
        endDate={props.endDate}
      />
      <AggregateByTimeSelectable
        title={'Travel times by hour'}
        data={props.traveltimes.by_time || []}
        seriesName={"Median travel time by day"}
        location={locationDescription}
        titleBothStops={true}
        isLoading={props.isLoadingTraveltimes}
       />
    </div>
  )
}

const SingleDaySet = (props) => {
  const locationDescription = getLocationDescription(props.from, props.to, props.line);
  const anyTravelBenchmarks = props.traveltimes.some(e => e.benchmark_travel_time_sec > 0);
  const anyHeadwayBenchmarks = props.headways.some(e => e.benchmark_headway_time_sec > 0);
  return(
    <div className='charts main-column'>
      <SingleDayLine
        {...dataFields.traveltimes}
        title={"Travel times"}
        data={props.traveltimes}
        useBenchmarks={anyTravelBenchmarks}
        location={locationDescription}
        titleBothStops={true}
        isLoading={props.isLoadingTraveltimes}
        date={props.startDate}
      />
      <SingleDayLine
        {...dataFields.headways}
        title={'Time between trains (headways)'}
        data={props.headways}
        useBenchmarks={anyHeadwayBenchmarks}
        location={locationDescription}
        titleBothStops={false}
        isLoading={props.isLoadingHeadways}
        date={props.startDate}
      />
      <SingleDayLine
        {...dataFields.dwells}
        title={'Time spent at station (dwells)'}
        data={props.dwells}
        useBenchmarks={false}
        location={locationDescription}
        titleBothStops={false}
        isLoading={props.isLoadingDwells}
        date={props.startDate}
      />
    </div>
  )
}

export { SingleDaySet, AggregateSet }
