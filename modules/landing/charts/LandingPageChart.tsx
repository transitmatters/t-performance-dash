import React, { useMemo } from 'react';

import { Line } from 'react-chartjs-2';
import type { ChartDataset } from 'chart.js';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import { COLORS } from '../../../common/constants/colors';
import { THREE_MONTHS_AGO_STRING, TODAY_STRING } from '../../../common/constants/dates';
import { SPEED_RANGE_PARAM_MAP } from '../../speed/constants/speeds';
import { LANDING_RAIL_LINES } from '../../../common/types/lines';
import { LINE_OBJECTS } from '../../../common/constants/lines';

interface LandingPageChartsProps {
  datasets: ChartDataset<'line'>[];
  labels: string[];
  id: string;
}

export const LandingPageChart: React.FC<LandingPageChartsProps> = ({ datasets, labels, id }) => {
  const chart = useMemo(() => {
    const { tooltipFormat, unit, callbacks } = SPEED_RANGE_PARAM_MAP.week;
    return (
      <div className="h-[240px]">
        <Line
          id={id}
          redraw={true}
          data={{
            labels,
            datasets: datasets,
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              intersect: false,
              mode: 'index',
            },
            plugins: {
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
        />
      </div>
    );
  }, [datasets, labels, id]);
  return chart;
};
