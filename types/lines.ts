import React from "react"
import { AggregateDataPoint, MetricField, PointField, SingleDayDataPoint } from "../src/charts/types"

export interface LineProps {
    title: string,
    chartId: string,
    location: any,
    isLoading: any,
    pointField: PointField;
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
    xMin?: Date,
    xMax?: Date,
    suggestedYMin?: number,
    suggestedYMax?: number,
    children?: React.ReactNode,
}

export interface SingleDayLineProps extends LineProps {
    data: SingleDayDataPoint[],
    seriesName: 'headway' | 'travel time' | 'dwell time',
    metricField: MetricField,
    useBenchmarks: boolean,
    benchmarkField: 'benchmark_travel_time_sec' | 'benchmark_headway_time_sec' | null,
    // TODO: Figure out if this is a date object
    date: any,
}