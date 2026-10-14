import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AggregateLineChart } from '../../../common/components/charts/AggregateLineChart';
import { CHART_COLORS } from '../../../common/constants/colors';
import type { AggregateDataResponse, DayFilter } from '../../../common/types/charts';
import { PointFieldKeys } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { getLocationDetails } from '../../../common/utils/stations';

interface HeadwaysAggregateChartProps {
  headways: AggregateDataResponse;
  toStation: Station;
  fromStation: Station;
  showLegend?: boolean;
  dayFilter?: DayFilter;
}

export const HeadwaysAggregateChart: React.FC<HeadwaysAggregateChartProps> = ({
  headways,
  toStation,
  fromStation,
  dayFilter = 'all',
}) => {
  const { t } = useTranslation('headways');
  const {
    query: { startDate, endDate },
  } = useDelimitatedRoute();

  const chart = useMemo(() => {
    // Filter data based on dayFilter
    let filteredData = headways.by_date.filter((datapoint) => datapoint.peak === 'all');

    if (dayFilter !== 'all') {
      filteredData = filteredData.filter((datapoint) => {
        if (!datapoint.service_date) return true; // Include data without service_date
        const isWeekendOrHolidayDate = datapoint.holiday || datapoint.weekend;
        return dayFilter === 'weekend' ? isWeekendOrHolidayDate : !isWeekendOrHolidayDate;
      });
    }

    return (
      <AggregateLineChart
        chartId={'headways_agg'}
        data={filteredData}
        // This is service date when agg by date. dep_time_from_epoch when agg by hour. Can probably remove this prop.
        pointField={PointFieldKeys.serviceDate}
        timeUnit={'day'}
        timeFormat={'MMM d yyyy'}
        seriesName={t('median')}
        startDate={startDate}
        endDate={endDate}
        fillColor={CHART_COLORS.FILL}
        location={getLocationDetails(fromStation, toStation)}
        includeBothStopsForLocation={false}
        fname="headways"
        yUnit="minutes"
      />
    );
  }, [headways.by_date, startDate, endDate, fromStation, toStation, dayFilter, t]);

  return chart;
};
