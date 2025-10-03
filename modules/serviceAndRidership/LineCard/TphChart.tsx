import React, { useMemo } from 'react';
import { Chart, Filler, Legend } from 'chart.js';
import Color from 'chartjs-color';
import { Line } from 'react-chartjs-2';

Chart.register(Filler, Legend);

import type { TripsPerHour } from '../types';
import { getHourlyTickValues } from '../time';

import styles from './LineCard.module.css';

const hourLabels = getHourlyTickValues(1);

type Props = {
  baselineTph: TripsPerHour;
  currentTph: TripsPerHour;
  highestTph: number;
  color: string;
};

export const TphChart = (props: Props) => {
  const { color, baselineTph, currentTph, highestTph } = props;
  const currentColor = Color(color).alpha(0.4).rgbaString();

  const data = useMemo(
    () => ({
      labels: hourLabels,
      datasets: [
        {
          label: 'Pre-COVID trips per hour',
          data: baselineTph,
          stepped: true,
          borderColor: color,
          borderWidth: 2,
          fill: true,
          backgroundColor: 'rgba(0,0,0,0)',
          pointRadius: 0,
        },
        {
          label: 'Current trips per hour',
          data: currentTph,
          stepped: true,
          borderWidth: 2,
          borderColor: 'rgba(0,0,0,0)',
          fill: true,
          backgroundColor: currentColor,
          pointRadius: 0,
        },
      ],
    }),
    [baselineTph, color, currentColor, currentTph]
  );

  const { datasets } = data;

  const chartJsOptions: React.ComponentProps<typeof Line>['options'] = useMemo(() => {
    return {
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          display: false,
        },
        legend: {
          position: 'top' as const,
          align: 'end' as const,
          labels: { boxWidth: 15 },
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          callbacks: {
            label: (context) => {
              const dataset = datasets[context.datasetIndex];
              const point = dataset.data[context.dataIndex];
              return `${dataset.label}: ${point} (each direction)`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 0,
          },
        },
        y: {
          min: 0,
          max: highestTph + 1,
        },
      },
    };
  }, [datasets, highestTph]);

  return (
    <div className={styles.tphChartContainer}>
      <Line height={100} redraw data={data} options={chartJsOptions} />
    </div>
  );
};
