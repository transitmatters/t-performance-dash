import React from 'react';
import classNames from 'classnames';
import { Line, Chart, defaults } from 'react-chartjs-2';
import merge from 'lodash.merge';
import {Legend, LegendLongTerm} from './Legend';
import drawTitle from './Title';
import writeError from './error';

Chart.Tooltip.positioners.first = (tooltipItems, eventPos) => {
  let x = eventPos.x;
  let y = eventPos.y;

  let firstElem = tooltipItems[0];
  if (firstElem && firstElem.hasValue()) {
    const pos = firstElem.tooltipPosition();
    x = pos.x;
    y = pos.y;
  }
  return {x, y};
};

const prettyDate = (dateString, with_dow) => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: with_dow ? 'long' : undefined,
  };
  return new Date(`${dateString}T00:00:00`)
    .toLocaleDateString(undefined, // user locale/language
                        options);
}

const departure_from_normal_string = (metric, benchmark) => {
  const ratio = metric / benchmark;
  if (!isFinite(ratio) || ratio <= 1.25) {
    return '';
  }
  else if (ratio <= 1.5) {
    return '>25% longer than normal';
  }
  else if (ratio <= 2.0) {
    return '>50% longer than normal';
  }
  else if (ratio > 2.0) {
    return '>100% longer than normal';
  }
};

const point_colors = (data, metric_field, benchmark_field) => {
  return data.map(point => {
    const ratio = point[metric_field] / point[benchmark_field];
    if (point[benchmark_field] === null) {
      return '#1c1c1c'; //grey
    }
    else if (ratio <= 1.25) {
      return '#64b96a'; //green
    }
    else if (ratio <= 1.5) {
      return '#f5ed00'; //yellow
    }
    else if (ratio <= 2.0) {
      return '#c33149'; //red
    }
    else if (ratio > 2.0) {
      return '#bb5cc1'; //purple
    }

    return '#1c1c1c'; //whatever
  });
}

merge(defaults, {
  global: {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 25
      }
    },
    legend: {
      display: false
    },
    title: {
      // empty title to set font and leave room for drawTitle fn
      display: true,
      text: "",
      fontSize: 16,
    },
    tooltips: {
      mode: "index",
      position: "first"
    }
  },
  scale: {
    scaleLabel: {
      display: true,
      fontSize: 14
    }
  }
});

class SingleDayLine extends React.Component {
  
  render() {
    /*
    Props:
      title
      data
      seriesName
      xField
      yField
      benchmarkField
      location (description used to generate title)
      isLoading
      date
    */
    const { isLoading } = this.props;
    let labels = this.props.data.map(item => item[this.props.xField]);
    return (
      <div className={classNames('chart', isLoading && 'is-loading')}>
      <div className="chart-container">
      <Line
      data={{
        labels,
        datasets: [
          {
            label: `Actual ${this.props.seriesName}`,
            fill: false,
            lineTension: 0.1,
            pointBackgroundColor: point_colors(this.props.data, this.props.yField, this.props.benchmarkField),
            pointHoverRadius: 3,
            pointHoverBackgroundColor: point_colors(this.props.data, this.props.yField, this.props.benchmarkField),
            pointRadius: 3,
            pointHitRadius: 10,
            data: this.props.data.map(item => (item[this.props.yField] / 60).toFixed(2))
          },
          {
            label: `Benchmark MBTA ${this.props.seriesName}`,
            data: this.props.useBenchmarks && this.props.data.map(item => (item[this.props.benchmarkField] / 60).toFixed(2)),
            pointRadius: 0
          }
        ]
      }}
      options={{
        tooltips: {
          // TODO: tooltip is under title words
          callbacks: {
            afterBody: (tooltipItems) => {
              return departure_from_normal_string(tooltipItems[0].value, tooltipItems[1]?.value);
            }
          }
        },
        scales: {
          yAxes: [{
            scaleLabel: {
              labelString: "Minutes"
            }
          }],
          xAxes: [{
            type: 'time',
            time: {
              unit: 'hour',
              unitStepSize: 1,
              tooltipFormat: "LTS" // locale time with seconds
            },
            scaleLabel: {
              labelString: prettyDate(this.props.date, true)
            },
            // make sure graph shows /at least/ 6am today to 1am tomorrow
            afterDataLimits: (axis) => {
              if (this.props.isLoading) {
                return; // prevents weird sliding animation
              }
              const today = new Date(`${this.props.date}T00:00:00`);
              let low = new Date(today);
              low.setHours(6,0);
              let high = new Date(today);
              high.setDate(high.getDate() + 1);
              high.setHours(1,0);
              axis.min = Math.min(axis.min, low) || null;
              axis.max = Math.max(axis.max, high) || null;
            }
          }]
        }
      }}
      plugins={[{
        afterDraw: (chart) => {
          drawTitle(this.props.title, this.props.location, this.props.titleBothStops, chart);
          if (!this.props.isLoading && !this.props.data.length) {
            writeError(chart);
          }
        }
      }]}
      />
      </div>
      <div className="chart-extras">
        {this.props.useBenchmarks && <Legend />}
      </div>
      </div>
    );
  }
}
 
class AggregateLine extends React.Component {
  
  render() {
    /*
    Props:
    xField
    timeUnit
    timeFormat
    xMin
    xMax
      title
      data
      seriesName
      location
      isLoading
      startDate
      endDate
    */
    const { isLoading } = this.props;
    let labels = this.props.data.map(item => item[this.props.xField]);
    return (
      <div className={classNames('chart', isLoading && 'is-loading')}>
      <div className="chart-container">
      <Line
      data={{
        labels,
        datasets: [
          {
            label: this.props.seriesName,
            fill: false,
            lineTension: 0.1,
            pointBackgroundColor: '#1c1c1c',
            pointHoverRadius: 3,
            pointHoverBackgroundColor: '#1c1c1c',
            pointRadius: 3,
            pointHitRadius: 10,
            data: this.props.data.map(item => (item["50%"] / 60).toFixed(2))
          },
          {
            label: "25th percentile",
            fill: 1,
            backgroundColor: this.props.fillColor,
            lineTension: 0.4,
            pointRadius: 0,
            data: this.props.data.map(item => (item["25%"] / 60).toFixed(2))
          },
          {
            label: "75th percentile",
            fill: 1,
            backgroundColor: this.props.fillColor,
            lineTension: 0.4,
            pointRadius: 0,
            data: this.props.data.map(item => (item["75%"] / 60).toFixed(2))
          },
        ]
      }}
      options={{
        scales: {
          yAxes: [{
            scaleLabel: {
              labelString: "Minutes"
            }
          }],
          xAxes: [{
            type: 'time',
            time: {
              unit: this.props.timeUnit,
              unitStepSize: 1,
              tooltipFormat: this.props.timeFormat
            },
            ticks: {
              // force graph to show startDate to endDate, even if missing data
              min: this.props.xMin,
              max: this.props.xMax,
            },
            scaleLabel: {
              labelString: this.props.xLabel,
            }
          }]
        }
      }}
      plugins={[{
        afterDraw: (chart) => {
          drawTitle(this.props.title, this.props.location, this.props.titleBothStops, chart);
          if (!this.props.isLoading && !this.props.data.length) {
            writeError(chart);
          }
        }
      }]}
      />
      </div>
      <div className="chart-extras">
        <LegendLongTerm />
        {this.props.children}
      </div>
      </div>
    );
  }
}

const AggregateByDate = (props) => {
  return(
    <AggregateLine
      {...props}
      xField={'service_date'}
      timeUnit={'day'}
      timeFormat={'ddd MMM D YYYY'} //momentjs format
      xMin={new Date(`${props.startDate}T00:00:00`)}
      xMax={new Date(`${props.endDate}T00:00:00`)}
      fillColor={"rgba(191,200,214,0.5)"}
      xLabel=""
    />
  )
}

const AggregateByTime = (props) => {
  return(
    <AggregateLine
      {...props}
      xField={'dep_time_from_epoch'}
      timeUnit={'hour'}
      timeFormat={'LT'} // momentjs format: locale time
      fillColor={"rgba(136,174,230,0.5)"}
      xLabel={`${prettyDate(props.startDate, false)} – ${prettyDate(props.endDate, false)}`}
      // xMin, xMax?
    />
  )
}

export { SingleDayLine, AggregateByDate, AggregateByTime };
