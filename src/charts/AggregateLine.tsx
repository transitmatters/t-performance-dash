import React from 'react';
import classNames from 'classnames';
// @ts-expect-error Chart seems to not be defined in the react-chartjs-2 ts modules
import { Line, Chart, defaults } from 'react-chartjs-2';
import merge from 'lodash.merge';
import { LegendLongTerm } from './Legend';
import drawTitle from './Title';
import writeError from './error';
import { DownloadButton } from './download';
import { prettyDate, yearLabel } from './lineUtils';
import { AggregatePoint, Location } from './types';

Chart.Tooltip.positioners.first = (tooltipItems: any, eventPos: any) => {
  let x = eventPos.x;
  let y = eventPos.y;

  const firstElem = tooltipItems[0];
  if (firstElem && firstElem.hasValue()) {
    const pos = firstElem.tooltipPosition();
    x = pos.x;
    y = pos.y;
  }
  return { x, y };
};

merge(defaults, {
  global: {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 25,
      },
    },
    legend: {
      display: false,
    },
    title: {
      // empty title to set font and leave room for drawTitle fn
      display: true,
      text: '',
      fontSize: 16,
    },
    tooltips: {
      mode: 'index',
      position: 'first',
    },
  },
  scale: {
    scaleLabel: {
      display: true,
      fontSize: 14,
    },
  },
});

interface AggregateLineProps {
  title: string;
  data: AggregatePoint[];
  isLoading: boolean;
  seriesName: string;
  xField: 'service_date' | 'dep_time_from_epoch';
  fname: string;
  location: Location;
  titleBothStops: boolean;
  fillColor: string;
  suggestedYMin?: number;
  suggestedYMax?: number;
  xMin?: Date;
  xMax?: Date;
  xLabel: string;
  timeFormat: string;
  timeUnit: string;
  startDate: string;
  endDate: string;
}

const AggregateLine: React.FC<AggregateLineProps> = ({
  title,
  titleBothStops,
  data,
  isLoading,
  seriesName,
  xField,
  fname,
  location,
  fillColor,
  suggestedYMin,
  suggestedYMax,
  xMin,
  xMax,
  xLabel,
  timeFormat,
  timeUnit,
  startDate,
  endDate,
  children,
}) => {
  const labels = data.map((item) => item[xField]);

  return (
    <div className={classNames('chart', isLoading && 'is-loading')}>
      <div className="chart-container">
        <Line
          data={{
            labels,
            datasets: [
              {
                label: seriesName,
                fill: false,
                lineTension: 0.1,
                pointBackgroundColor: '#1c1c1c',
                pointHoverRadius: 3,
                pointHoverBackgroundColor: '#1c1c1c',
                pointRadius: 3,
                pointHitRadius: 10,
                data: data.map((item) => (item['50%'] / 60).toFixed(2)),
              },
              {
                label: '25th percentile',
                fill: 1,
                backgroundColor: fillColor,
                lineTension: 0.4,
                pointRadius: 0,
                data: data.map((item) => (item['25%'] / 60).toFixed(2)),
              },
              {
                label: '75th percentile',
                fill: 1,
                backgroundColor: fillColor,
                lineTension: 0.4,
                pointRadius: 0,
                data: data.map((item) => (item['75%'] / 60).toFixed(2)),
              },
            ],
          }}
          options={{
            scales: {
              yAxes: [
                {
                  scaleLabel: {
                    labelString: 'Minutes',
                  },
                  ticks: {
                    suggestedMin: suggestedYMin,
                    suggestedMax: suggestedYMax,
                  },
                },
              ],
              xAxes: [
                {
                  type: 'time',
                  time: {
                    unit: timeUnit,
                    unitStepSize: 1,
                    tooltipFormat: timeFormat,
                  },
                  ticks: {
                    // force graph to show startDate to endDate, even if missing data
                    min: xMin,
                    max: xMax,
                  },
                  scaleLabel: {
                    labelString: xLabel,
                  },
                },
              ],
            },
          }}
          plugins={[
            {
              afterDraw: (chart: any) => {
                drawTitle(title, location, titleBothStops, chart);
                if (!isLoading && !data.length) {
                  writeError(chart);
                }
              },
            },
          ]}
        />
        <DownloadButton
          data={data}
          datasetName={fname}
          location={location}
          bothStops={titleBothStops}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
      <div className="chart-extras">
        <LegendLongTerm />
        {children}
      </div>
    </div>
  );
};

export const AggregateByDate: React.FC<AggregateLineProps> = (props) => {
  return (
    <AggregateLine
      {...props}
      xField={'service_date'}
      timeUnit={'day'}
      timeFormat={'ddd MMM D YYYY'} //momentjs format
      xMin={new Date(`${props.startDate}T00:00:00`)}
      xMax={new Date(`${props.endDate}T00:00:00`)}
      fillColor={'rgba(191,200,214,0.5)'}
      xLabel={yearLabel(props.startDate, props.endDate)}
    />
  );
};

export const AggregateByTime: React.FC<AggregateLineProps> = (props) => {
  return (
    <AggregateLine
      {...props}
      xField={'dep_time_from_epoch'}
      timeUnit={'hour'}
      timeFormat={'LT'} // momentjs format: locale time
      fillColor={'rgba(136,174,230,0.5)'}
      xLabel={`${prettyDate(props.startDate, false)} – ${prettyDate(props.endDate, false)}`}
      // xMin, xMax?
    />
  );
};
