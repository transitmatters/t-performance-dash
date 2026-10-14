import React, { useMemo } from 'react';
import { Chart, Filler, Legend } from '@chartjs-utils';
import Color from 'color';
import { Line } from '@chartjs-components';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('serviceAndRidership');
  const { color, baselineTph, currentTph, highestTph } = props;
  const currentColor = Color(color).alpha(0.4).rgb().string();

  const data = useMemo(
    () => ({
      labels: hourLabels,
      datasets: [
        {
          label: t('tph.baseline'),
          data: baselineTph,
          stepped: true,
          borderColor: color,
          borderWidth: 2,
          fill: true,
          backgroundColor: 'rgba(0,0,0,0)',
          pointRadius: 0,
        },
        {
          label: t('tph.current'),
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
    [baselineTph, color, currentColor, currentTph, t]
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
              return t('tph.tooltip', { label: dataset.label, value: point });
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
  }, [datasets, highestTph, t]);

  return (
    <div className={styles.tphChartContainer}>
      <Line height={100} redraw data={data} options={chartJsOptions} />
    </div>
  );
};
