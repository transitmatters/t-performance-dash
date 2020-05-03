import React from 'react';
import { Line } from 'react-chartjs-2';

const departure_from_normal_string = (metric, benchmark) => {
  const ratio = metric/benchmark;
  if(ratio <= 1.25) {
    return '';
  }
  else if(ratio <= 1.5) {
    return '>25% longer than normal';
  }
  else if(ratio > 1.5) {
    return '>50% longer than normal';
  }

};

const point_colors = (data, metric_field, benchmark_field) => {
  return data.map(point => {
    const ratio = point[metric_field]/point[benchmark_field];
    if(ratio <= 1.25) {
      return '#75c400'; //green
    }
    else if(ratio <= 1.5) {
      return '#e5a70b'; //yellow
    }
    else if(ratio > 1.5) {
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
    */

    let labels = this.props.data.map(item => item[this.props.xField]);
    return (
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
                data: this.props.data.map(item => item[this.props.benchmarkField]/60),
                pointRadius: 0
              }
            ]
          }}
          options={{
            responsive: true,
            title: {
              display: true,
              text: this.props.title,
              fontSize: 16
            },
            tooltips: {
              mode: "index",
              callbacks: {
                title: (tooltipItems, _) => {
                  return new Date(tooltipItems[0].xLabel).toLocaleTimeString();
                },
                label: (tooltipItem, _) => {
                  console.log("tooltipItem: ", tooltipItem);
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
        />
      </div>
    );
  }
}

export default LineClass;
