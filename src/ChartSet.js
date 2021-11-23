import React from 'react';
import { SingleDayLine, AggregateLine } from './line';
import { station_direction } from './stations';


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

function AggregateSet(props) {
  const locationDescription = getLocationDescription(props.from, props.to, props.line)
  return(
    <div className='charts main-column'>
      <AggregateLine
        title={"Travel times"}
        data={props.traveltimes}
        seriesName={"Median travel time"}
        location={locationDescription}
        titleBothStops={true}
        isLoading={props.isLoadingTraveltimes}
        startDate={props.startDate}
        endDate={props.endDate}
      />
      <AggregateLine
        title={'Time between trains (headways)'}
        data={props.headways}
        seriesName={'Median headway'}
        location={locationDescription}
        titleBothStops={false}
        isLoading={props.isLoadingHeadways}
        startDate={props.startDate}
        endDate={props.endDate}
      />
      <AggregateLine
        title={'Time spent at station (dwells)'}
        data={props.dwells}
        seriesName={'Median dwell time'}
        location={locationDescription}
        titleBothStops={false}
        isLoading={props.isLoadingDwells}
        startDate={props.startDate}
        endDate={props.endDate}
      />
    </div>
  )
}

function SingleDaySet(props) {
  const locationDescription = getLocationDescription(props.from, props.to, props.line)
  return <div className='charts main-column'>
        <SingleDayLine
          title={"Travel times"}
          data={props.traveltimes}
          seriesName={"travel time"}
          xField={'dep_dt'}
          yField={'travel_time_sec'}
          benchmarkField={(props.traveltimes.some(e => e.benchmark_travel_time_sec > 0)) ? 'benchmark_travel_time_sec' : null}
          location={locationDescription}
          titleBothStops={true}
          isLoading={props.isLoadingTraveltimes}
          date={props.startDate}
        />
        <SingleDayLine
          title={'Time between trains (headways)'}
          data={props.headways}
          seriesName={"headway"}
          xField={"current_dep_dt"}
          yField={'headway_time_sec'}
          benchmarkField={(props.headways.some(e => e.benchmark_headway_time_sec > 0)) ? 'benchmark_headway_time_sec' : null}
          location={locationDescription}
          titleBothStops={false}
          isLoading={props.isLoadingHeadways}
          date={props.startDate}
        />
        <SingleDayLine
          title={'Time spent at station (dwells)'}
          data={props.dwells}
          seriesName={"dwell time"}
          xField={"arr_dt"}
          yField={"dwell_time_sec"}
          benchmarkField={null}
          location={locationDescription}
          titleBothStops={false}
          isLoading={props.isLoadingDwells}
          date={props.startDate}
        />
      </div>
}

export { SingleDaySet, AggregateSet }