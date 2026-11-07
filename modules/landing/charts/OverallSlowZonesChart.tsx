import React, { useMemo } from 'react';
import type { ChartDataset } from 'chart.js';
import dayjs from 'dayjs';
import { round } from 'lodash';
import { LINE_COLORS } from '../../../common/constants/colors';
import type { DayDelayTotals } from '../../../common/types/dataPoints';
import { LandingChartDiv } from '../LandingChartDiv';
import { SlowZonesBaseline } from '../../../copy/landingCopy';
import { SlowZonesLandingChart } from './SlowZonesLandingChart';

interface OverallSlowZonesChartProps {
  data: DayDelayTotals[];
}

const LINES_CONFIG: { key: keyof DayDelayTotals; line: string; color: string }[] = [
  { key: 'Red', line: 'line-red', color: LINE_COLORS['line-red'] },
  { key: 'Orange', line: 'line-orange', color: LINE_COLORS['line-orange'] },
  { key: 'Blue', line: 'line-blue', color: LINE_COLORS['line-blue'] },
  { key: 'Green', line: 'line-green', color: LINE_COLORS['line-green'] },
];

export const OverallSlowZonesChart: React.FC<OverallSlowZonesChartProps> = ({ data }) => {
  const { labels, datasets } = useMemo(() => {
    // Get last ~14 weeks of data
    const cutoff = dayjs().subtract(14, 'weeks');
    const filtered = data.filter((d) => dayjs(d.date).isAfter(cutoff));

    const labels = filtered.map((d) => d.date);

    const datasets: ChartDataset<'line'>[] = LINES_CONFIG.map(({ key, color }) => ({
      data: filtered.map((d) => round((d[key] as number) / 60, 1)),
      borderColor: color,
      backgroundColor: color,
      pointBackgroundColor: color,
      pointBorderWidth: 0,
      borderWidth: 3,
      pointRadius: 3,
      pointHitRadius: 8,
      tension: 0.2,
      spanGaps: true,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: color,
    }));

    return { labels, datasets };
  }, [data]);

  return (
    <LandingChartDiv>
      <SlowZonesLandingChart datasets={datasets} labels={labels} id="slow-zones" />
      {SlowZonesBaseline}
    </LandingChartDiv>
  );
};
