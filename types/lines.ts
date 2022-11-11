import React from "react"
import { DownloadDataPoint } from "../src/charts/types"

export interface LineProps {
    title: string,
    data: DownloadDataPoint[],
    location: any,
    isLoading: any,
    xField: 'dep_time_from_epoch' | 'service_date' | 'dep_dt' | 'current_dep_dt' | 'arr_dt',
    useBenchmarks: any,
    titleBothStops: any,
    fname: any,
}

export interface AggregateLineProps extends LineProps {
    timeUnit: 'day' | 'hour',
    timeFormat: string,
    seriesName: string,
    startDate: any,
    endDate: any,
    fillColor: any,
    suggestedYMin: number,
    suggestedYMax: number,
    xLabel: any,
    xMin?: Date,
    xMax?: Date,
    children?: React.ReactNode,
 }

 export interface SingleDayLineProps extends LineProps {
      seriesName: 'headway' | 'travel time' | 'dwell time',
      yField: 'headway_time_sec' | 'dwell_time_sec',
      benchmarkField: 'benchmark_travel_time_sec' | 'benchmark_headway_time_sec' | null,

      // TODO: Figure out if this is a date object
      date: any,
 }