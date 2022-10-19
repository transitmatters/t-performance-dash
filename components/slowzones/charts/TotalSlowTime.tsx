import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import { Line } from 'react-chartjs-2';
import { colorsForLine } from '../../../utils/constants';

import { DayDelayTotals } from '../../../types/dataPoints';

ChartJS.register(
  TimeScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const TotalSlowTime = ({ data }: { data?: DayDelayTotals[] }) => {
  const labels = data?.map((item) => item['date']);
  return (
    <div className={'chart'}>
      <div className="chart-container">
        <Line
          id={'total_slow_time'}
          height={650}
          data={{
            labels,
            datasets: [
              {
                label: 'Blue Line',
                data: data?.map((d) => (d.Blue / 60).toFixed(2)),
                borderColor: colorsForLine['Blue'],
                backgroundColor: colorsForLine['Blue'],
                pointRadius: 0,
              },
              {
                label: 'Red Line',
                data: data?.map((d) => (d.Red / 60).toFixed(2)),
                borderColor: colorsForLine['Red'],
                backgroundColor: colorsForLine['Red'],
                pointRadius: 0,
              },
              {
                label: 'Orange Line',
                data: data?.map((d) => (d.Orange / 60).toFixed(2)),
                borderColor: colorsForLine['Orange'],
                backgroundColor: colorsForLine['Orange'],
                pointRadius: 0,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: {
                top: 25,
              },
            },
            scales: {
              y: {
                display: true,
                title: {
                  display: true,
                  text: 'Minutes',
                },
              },
              x: {
                type: 'time',
                time: {
                  unit: 'month',
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
        />
      </div>
    </div>
  );
};
