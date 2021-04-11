import React from 'react';
import classNames from 'classnames';
import { Line, Chart } from 'react-chartjs-2';
import {Legend, LegendLongTerm} from './Legend';
import drawTitle from './Title';

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

class LineClass extends React.Component {

  render() {
    /*
    Props:
      seriesName
      xField
      xFieldLabel
      yField
      yFieldLabel
      benchmarkField
      alerts
    */
    const { isLoading } = this.props;
    let labels = this.props.data.map(item => item[this.props.xField]);
    return (
      <div className={classNames('chart', isLoading && 'is-loading')}>
        <div className="chart-container">
          <Line
            legend={{ display: false }}
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
                  label: "25th percentile",
                  fill: "+1",
                  backgroundColor: "#bfc8d6",
                  lineTension: 0.4,
                  pointRadius: 0,
                  data: this.props.data.map(item => (item["25%"] / 60).toFixed(2))
                },
                {
                  label: "75th percentile",
                  fill: "-1",
                  lineTension: 0.4,
                  pointRadius: 0,
                  data: this.props.data.map(item => (item["75%"] / 60).toFixed(2))
                },
                {
                  label: `Benchmark MBTA ${this.props.seriesName}`,
                  data: this.props.data.map(item => (item[this.props.benchmarkField] / 60).toFixed(2)),
                  pointRadius: 0
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              layout: {
                padding: {
                  top: 25
                }
              },
              title: {
                // empty title here to leave space and set font for the drawTitle process
                display: true,
                text: "",
                fontSize: 16
              },
              tooltips: {
                mode: "index",
                position: "first",
                callbacks: {
                  title: (tooltipItems, _) => {
                    if (this.props.timescale === "day") {
                      /* In aggregation mode, dates come back from the server no times.
                        Because we're -4/-5 UTC, the resulting strings become 7pm/8pm the previous day with affixing 00:00:00.
                        Blegh */
                      const date = new Date(`${tooltipItems[0].xLabel}T00:00:00`); // Safari won't parse "2021-03-30" alone
                      return date.toDateString();
                    }
                    else if(this.props.timescale === "hour") {
                      const date = new Date(tooltipItems[0].xLabel);
                      return date.toLocaleTimeString();
                    }
                  },
                  // label: (tooltipItem, _) => {
                  //   if (tooltipItem.datasetIndex === 0) {
                  //     return `Actual ${this.props.tooltipUnit}: ${parseFloat(tooltipItem.value).toFixed(2)}`;
                  //   }
                  //   return `Benchmark MBTA ${this.props.tooltipUnit}: ${parseFloat(tooltipItem.value).toFixed(2)}`;
                  // },
                  afterBody: (tooltipItems) => {
                    if (tooltipItems.length > 1) {
                      return departure_from_normal_string(tooltipItems[0].value, tooltipItems[1].value);
                    }
                  }
                }
              },
              scales: {
                yAxes: [
                  {
                    scaleLabel: {
                      display: true,
                      fontSize: 14,
                      labelString: this.props.yFieldLabel
                    }
                  }
                ],
                xAxes: [
                  {
                    type: this.props.xFieldType || 'time',
                    time: {
                      unit: this.props.xFieldUnit || 'hour',
                      unitStepSize: 1
                    },
                    scaleLabel: {
                      display: true,
                      fontSize: 14,
                      labelString: this.props.xFieldLabel
                    },
                    // make sure graph shows /at least/ suggestedXRange, either end will extend to not hide points.
                    afterDataLimits: (axis) => {if (this.props.isLoading) return; // prevents weird sliding animation
                                                axis.min = Math.min(axis.min, this.props.suggestedXRange[0]) || null;
                                                axis.max = Math.max(axis.max, this.props.suggestedXRange[1]) || null;}
                  }
                ]
              }
            }}
            plugins={[{
              afterDraw: (chart) => drawTitle(this.props.title, this.props.location, chart)
            }]}
          />
        </div>
        {this.props.timescale === 'day' && <LegendLongTerm />}
        {this.props.timescale === 'hour' && this.props.yField !== "dwell_time_sec" && <Legend />}
      </div>
    );
  }
}

export default LineClass;
