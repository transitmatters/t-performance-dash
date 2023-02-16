import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import React, { useRef } from 'react';
import type { SingleDayLineProps } from '../../../common/types/lines';
import { useDelimitatedRoute } from '../../utils/router';
import { LINE_COLORS } from '../../constants/colors';
import { drawTitle } from './Title';
import { Legend as LegendView } from './Legend';

ChartJS.register(
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

export const HeadwayHistogram: React.FC<SingleDayLineProps> = ({
  chartId,
  title,
  data,
  date,
  metricField,
  pointField,
  benchmarkField,
  // TODO: loading animation?
  isLoading,
  bothStops = false,
  location,
  homescreen = false,
  showLegend = true,
}) => {
  const ref = useRef();

  let max = 0;
  const dataObject =
    data?.reduce(
      (datapointMap: Record<string, number>, datapoint: any) => {
        const bucketString = Math.floor(datapoint[metricField] / 60).toString();

        while (datapointMap[bucketString] == null) {
          max += 1;
          datapointMap[max.toString()] = 0;
        }
        datapointMap[bucketString] = datapointMap[bucketString] + 1;
        return datapointMap;
      },
      { '0': 0 }
    ) || {};

  const labels = Object.keys(dataObject).map((time) => `${time}:00`);
  const dataArray = Object.entries(dataObject).map((entry) => entry[1]);

  const { line } = useDelimitatedRoute();
  return (
    <div className={showLegend ? 'chart' : undefined}>
      <div className={'chart-container'}>
        <Bar
          id={'histod'}
          ref={ref}
          height={250}
          redraw={true}
          data={{
            labels,
            datasets: [
              {
                backgroundColor: LINE_COLORS[line ?? 'default'],
                label: `Actual`,
                // TODO: would be nice to add types to these arrow functions - but causes an issue bc datapoint[field] might be undefined.
                data: dataArray,
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
            plugins: {
              tooltip: {
                mode: 'index',
                position: 'nearest',
              },
              legend: {
                display: false,
              },
              title: {
                // empty title to set font and leave room for drawTitle fn
                display: true,
                text: '',
              },
            },
            interaction: {
              mode: 'nearest',
              intersect: false,
            },
            // animation: false,
          }}
          plugins={[
            {
              id: 'customTitle',
              afterDraw: (chart) => {
                if ((date === undefined || date.length === 0) && !isLoading) {
                  // No data is present
                  const ctx = chart.ctx;
                  const width = chart.width;
                  const height = chart.height;
                  chart.clear();

                  ctx.save();
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.font = "16px normal 'Helvetica Nueue'";
                  ctx.fillText('No data to display', width / 2, height / 2);
                  ctx.restore();
                }
                drawTitle(title, location, bothStops, chart);
              },
            },
          ]}
        />
      </div>
      {showLegend && <div className="chart-extras">{benchmarkField && <LegendView />}</div>}
    </div>
  );
};
