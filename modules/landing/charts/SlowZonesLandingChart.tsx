import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartDataset } from 'chart.js';
import dayjs from 'dayjs';

import 'chartjs-adapter-date-fns';
import ChartjsPluginWatermark from 'chartjs-plugin-watermark';

import { enUS } from 'date-fns/locale';
import { COLORS } from '../../../common/constants/colors';
import {
  PRETTY_DATE_FORMAT,
  THREE_MONTHS_AGO_STRING,
  TODAY_STRING,
} from '../../../common/constants/dates';
import { SPEED_RANGE_PARAM_MAP } from '../../speed/constants/speeds';
import { watermarkLayout } from '../../../common/constants/charts';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';

const LINE_NAMES = ['Red Line', 'Orange Line', 'Blue Line', 'Green Line'];

interface SlowZonesLandingChartProps {
  datasets: ChartDataset<'line'>[];
  labels: string[];
  id: string;
}

export const SlowZonesLandingChart: React.FC<SlowZonesLandingChartProps> = ({
  datasets,
  labels,
  id,
}) => {
  const isMobile = !useBreakpoint('md');

  const chart = useMemo(() => {
    const watermarkLayoutValues = watermarkLayout(isMobile);
    const { tooltipFormat, unit } = SPEED_RANGE_PARAM_MAP.week;
    return (
      <div className="chart-container relative h-[280px] w-full">
        <Line
          id={id}
          redraw={true}
          data={{
            labels,
            datasets,
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              intersect: false,
              mode: 'index',
            },
            // @ts-expect-error The watermark plugin doesn't have typescript support
            watermark: watermarkLayoutValues,
            plugins: {
              datalabels: {
                display: false,
              },
              tooltip: {
                position: 'nearest',
                callbacks: {
                  label: (value) =>
                    `${value.formattedValue} min (${LINE_NAMES[value.datasetIndex]})`,
                  title: (value) => {
                    const startDay = dayjs(value[0].label);
                    return startDay.format(PRETTY_DATE_FORMAT);
                  },
                },
              },
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                display: true,
                grid: { display: false },
                ticks: {
                  color: COLORS.design.darkGrey,
                  callback: (value) => `${value} min`,
                },
                title: {
                  display: true,
                  text: 'Total delay (minutes)',
                  color: COLORS.design.darkGrey,
                },
              },
              x: {
                min: THREE_MONTHS_AGO_STRING,
                max: TODAY_STRING,
                type: 'time',
                grid: { display: false },
                time: {
                  unit: unit,
                  tooltipFormat: tooltipFormat,
                },
                ticks: {
                  color: COLORS.design.darkGrey,
                },
                adapters: {
                  date: {
                    locale: enUS,
                  },
                },
                display: true,
              },
            },
          }}
          plugins={[ChartjsPluginWatermark]}
        />
      </div>
    );
  }, [datasets, labels, id, isMobile]);
  return chart;
};
