import React from "react"
import { AggregateDataPoint, SingleDayDataPoint } from "../src/charts/types"

export interface LineProps {
    title: string,
    chartId: string,
    metricField: string,
    data: SingleDayDataPoint[] | AggregateDataPoint[],
    location: any,
    isLoading: any,
    pointField: 'dep_time_from_epoch' | 'service_date' | 'dep_dt' | 'current_dep_dt' | 'arr_dt',
    bothStops: any,
    fname: any,
}

export interface AggregateLineProps extends LineProps {
    timeUnit: 'day' | 'hour',
    //TODO: figure out why it breaks when I don't specify the aggregate point.
    data: AggregateDataPoint[]
    timeFormat: string,
    seriesName: string,
    startDate: any,
    endDate: any,
    fillColor: any,
    xLabel: any,
    xMin?: Date,
    xMax?: Date,
    suggestedYMin?: number,
    suggestedYMax?: number,
    children?: React.ReactNode,
 }

 export interface SingleDayLineProps extends LineProps {
     seriesName: 'headway' | 'travel time' | 'dwell time',
     yField: 'headway_time_sec' | 'dwell_time_sec',
     useBenchmarks: boolean,
     benchmarkField: 'benchmark_travel_time_sec' | 'benchmark_headway_time_sec' | null,

      // TODO: Figure out if this is a date object
      date: any,
 }