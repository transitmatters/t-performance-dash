import React, { useMemo } from 'react';

import { Line } from 'react-chartjs-2';
import type { ChartDataset } from 'chart.js';
import dayjs from 'dayjs';

import 'chartjs-adapter-date-fns';
import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { enUS } from 'date-fns/locale';
import { COLORS } from '../../../common/constants/colors';
import {
  PRETTY_DATE_FORMAT,
  THREE_MONTHS_AGO_STRING,
  TODAY_STRING,
} from '../../../common/constants/dates';
import { SPEED_RANGE_PARAM_MAP } from '../../speed/constants/speeds';
import { DATA_LABELS_LANDING, watermarkLayout } from '../../../common/constants/charts';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';

interface FleetAgeChartProps {
  datasets: ChartDataset<'line'>[];
  labels: string[];
  id: string;
}

const CHART_PADDING = 48;

export const FleetAgeChart: React.FC<FleetAgeChartProps> = ({ datasets, labels, id }) => {
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
            datasets: datasets,
          }}
          options={{
            layout: {
              padding: { right: CHART_PADDING },
            },
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              intersect: false,
              mode: 'point',
            },
            // @ts-expect-error The watermark plugin doesn't have typescript support
            watermark: { ...watermarkLayoutValues, x: watermarkLayoutValues.x - CHART_PADDING },
            plugins: {
              datalabels: {
                ...DATA_LABELS_LANDING,
                formatter: (value: number) => `${value}y`,
              },
              tooltip: {
                position: 'nearest',
                callbacks: {
                  label: (value) => `${value.formattedValue} years (${value.dataset.label})`,
                  title: (value) => {
                    const startDay = dayjs(value[0].label);
                    const endDay = startDay.add(6, 'days');
                    return `${startDay.format(PRETTY_DATE_FORMAT)} - ${endDay.format(
                      PRETTY_DATE_FORMAT
                    )}`;
                  },
                },
              },
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                reverse: true,
                suggestedMin: 0,
                suggestedMax: 40,
                display: true,
                grid: { display: false },
                ticks: {
                  color: COLORS.design.darkGrey,
                  callback: (value) => `${value}y`,
                },
                title: {
                  display: true,
                  text: 'Average car age (years)',
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
                title: {
                  display: false,
                  text: ``,
                },
              },
            },
          }}
          plugins={[ChartjsPluginWatermark, ChartDataLabels]}
        />
      </div>
    );
  }, [datasets, labels, id, isMobile]);
  return chart;
};
