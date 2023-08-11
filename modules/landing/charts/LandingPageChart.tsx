import React, { useMemo } from 'react';

import { Line } from 'react-chartjs-2';
import type { ChartDataset } from 'chart.js';

import 'chartjs-adapter-date-fns';
import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { enUS } from 'date-fns/locale';
import { COLORS } from '../../../common/constants/colors';
import {
  ONE_WEEK_AGO_STRING,
  THREE_MONTHS_AGO_STRING,
  TODAY_STRING,
} from '../../../common/constants/dates';
import { SPEED_RANGE_PARAM_MAP } from '../../speed/constants/speeds';
import { LANDING_RAIL_LINES } from '../../../common/types/lines';
import { LINE_OBJECTS } from '../../../common/constants/lines';
import { watermarkLayout } from '../../../common/constants/charts';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { isMobile } from 'react-device-detect';

interface LandingPageChartsProps {
  datasets: ChartDataset<'line'>[];
  labels: string[];
  id: string;
}
// Add padding for datalabels.
const CHART_PADDING = 48;

export const LandingPageChart: React.FC<LandingPageChartsProps> = ({ datasets, labels, id }) => {
  const isMobile = !useBreakpoint('md');
  const watermarkLayoutValues = watermarkLayout(isMobile);

  const chart = useMemo(() => {
    const { tooltipFormat, unit, callbacks } = SPEED_RANGE_PARAM_MAP.week;
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
            watermark: { ...watermarkLayoutValues, x: watermarkLayoutValues.x - CHART_PADDING }, // Adjust x to
            plugins: {
              datalabels: {
                align: 'right', // Position of the labels relative to the data points
                anchor: 'start',
                clip: false,
                color: '#ffffffe0', // Background color of the labels
                padding: {
                  top: 0,
                  bottom: 0,
                  right: 4,
                  left: 4,
                },
                borderRadius: 10, // Border radius of the labels

                font: {
                  size: 12, // Font size of the labels
                },
                display: (context) => context.dataIndex === context.dataset.data.length - 1,
                formatter: (value) => `${value}%`, // Format the label content
              },
              tooltip: {
                position: 'nearest',
                callbacks: {
                  label: (value) =>
                    `${value.formattedValue}% of historical maximum (${
                      LINE_OBJECTS[LANDING_RAIL_LINES[value.datasetIndex]].name
                    })`,
                  ...callbacks,
                },
              },
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                suggestedMax: 100,
                display: true,
                grid: { display: false },
                ticks: {
                  color: COLORS.design.darkGrey,
                  callback: (value) => `${value}%`,
                },
                title: {
                  display: true,
                  text: 'Percentage of historical maximum',
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
