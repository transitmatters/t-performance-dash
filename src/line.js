import React from 'react';
import classNames from 'classnames';
import { Line } from 'react-chartjs-2';
import Legend from './Legend';
import drawTitle from './Title';

const departure_from_normal_string = (metric, benchmark) => {
  const ratio = metric / benchmark;
  if (ratio <= 1.25) {
    return '';
  }
  else if (ratio <= 1.5) {
    return '>25% longer than normal';
  }
  else if (ratio > 1.5) {
    return '>50% longer than normal';
  }

};

const point_colors = (data, metric_field, benchmark_field) => {
  return data.map(point => {
    const ratio = point[metric_field] / point[benchmark_field];
    if (point[benchmark_field] === null) {
      return '#1c1c1c'; //grey
    }
    else if (ratio <= 1.25) {
      return '#75c400'; //green
    }
    else if (ratio <= 1.5) {
      return '#e5a70b'; //yellow
    }
    else if (ratio > 1.5) {
      return '#e53a0b'; //red
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

    // const alert_annotations = this.props.alerts.map((alert, idx) => {
    //   return {
    //     type: 'line',
    //     mode: 'vertical',
    //     scaleID: 'x-axis-0',
    //     value: alert.valid_from,
    //     borderColor: 'red',
    //     borderWidth: 1,
    //     label: {
    //       backgroundColor: "red",
    //       yAdjust: idx * 30,
    //       position: "top",
    //       content: alertText(alert),
    //       enabled: true
    //     }
    //   }
    // });
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
                  label: this.props.seriesName,
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
                  label: `${this.props.seriesName}_benchmark`,
                  data: this.props.data.map(item => item[this.props.benchmarkField] / 60),
                  pointRadius: 0
                }
              ]
            }}
            options={{
              responsive: true,
              // annotation: {
              //   annotations: alert_annotations
              // },
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
                callbacks: {
                  title: (tooltipItems, _) => {
                    return new Date(tooltipItems[0].xLabel).toLocaleTimeString();
                  },
                  label: (tooltipItem, _) => {
                    if (tooltipItem.datasetIndex === 0) {
                      return `Actual ${this.props.tooltipUnit}: ${parseFloat(tooltipItem.value).toFixed(2)}`;
                    }
                    return `Benchmark MBTA ${this.props.tooltipUnit}: ${parseFloat(tooltipItem.value).toFixed(2)}`;
                  },
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
                    type: 'time',
                    time: {
                      unit: 'hour',
                      unitStepSize: 1
                    },
                    scaleLabel: {
                      display: true,
                      fontSize: 14,
                      labelString: this.props.xFieldLabel
                    }
                  }
                ]
              }
            }}
            plugins={{
              afterDraw: (chart) => drawTitle(this.props.title, this.props.location, chart)
            }}
          />
        </div>
        {this.props.legend && <Legend />}
      </div>
    );
  }
}

export default LineClass;
