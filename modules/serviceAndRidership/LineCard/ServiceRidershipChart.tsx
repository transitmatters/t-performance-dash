import React, { useMemo } from 'react';

import type { LineData } from '../types';

import type { Dataset } from '../../../common/components/charts/TimeSeriesChart';
import { TimeSeriesChart } from '../../../common/components/charts/TimeSeriesChart';
import styles from './LineCard.module.css';

type BaselineMode = 'start' | 'max';

type Props = {
  ridershipHistory: LineData['ridershipHistory'];
  serviceHistory: LineData['serviceHistory'];
  color: string;
  startDate: undefined | string;
  endDate: undefined | string;
  lineTitle: string;
  lineId: string;
  baselineMode?: BaselineMode;
};

const getRidershipNoun = (lineId: string) => {
  if (['line-Red', 'line-Orange', 'line-Blue', 'line-Green'].includes(lineId)) {
    return 'faregate validations';
  }
  return 'riders';
};

const asPercentString = (p: number) => Math.round(100 * p).toString() + '%';

const getBaselineKey = (data: Record<string, number>, baselineMode: BaselineMode) => {
  const keys = Object.keys(data);
  if (baselineMode === 'max') {
    let highestValue = -Infinity;
    let highestKey = keys[0];
    Object.entries(data).forEach(([key, value]) => {
      if (value > highestValue) {
        highestValue = value;
        highestKey = key;
      }
    });
    return highestKey;
  }
  return keys[0];
};

const getNormalizedData = (
  data: Record<string, number>,
  startDate: undefined | string,
  endDate: undefined | string,
  baselineMode: BaselineMode
) => {
  const dateStringsWithinRange = Object.keys(data)
    .filter((date) => {
      if (!startDate || !endDate) {
        return true;
      }
      return date >= startDate && date <= endDate;
    })
    .sort();
  const baselineKey = getBaselineKey(data, baselineMode);
  const baseline = data[baselineKey];
  return dateStringsWithinRange.map((date) => ({
    date,
    value: data[date] / baseline,
    actualValue: data[date],
  }));
};

export const ServiceRidershipChart = (props: Props) => {
  const {
    color,
    serviceHistory,
    ridershipHistory,
    startDate,
    endDate,
    lineId,
    baselineMode = 'max',
  } = props;

  const data = useMemo((): Dataset[] => {
    const service: Dataset = {
      label: 'Service levels',
      data: getNormalizedData(serviceHistory, startDate, endDate, baselineMode),
      style: {
        fillPattern: 'striped' as const,
        tooltipLabel(point) {
          const { actualValue } = point as unknown as { actualValue: number };
          return `Service levels: ${actualValue} trips/day`;
        },
      },
    };
    if (ridershipHistory) {
      return [
        service,
        {
          label: 'Ridership',
          data: getNormalizedData(ridershipHistory, startDate, endDate, baselineMode),
          style: {
            tooltipLabel(point) {
              const { actualValue } = point as unknown as { actualValue: number };
              return `Ridership: ${actualValue} ${getRidershipNoun(lineId)}/day`;
            },
          },
        },
      ];
    }
    return [service];
  }, [serviceHistory, startDate, endDate, ridershipHistory, lineId, baselineMode]);

  return (
    <div className={styles.serviceAndRidershipChartContainer}>
      <TimeSeriesChart
        data={data}
        valueAxis={{ renderTickLabel: asPercentString, min: 0 }}
        timeAxis={{ granularity: 'week' }}
        legend={{ visible: true, align: 'end', position: 'top' }}
        style={{ color, stepped: true, fill: true }}
      />
    </div>
  );
};
