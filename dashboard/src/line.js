import React from 'react';
import { Line } from 'react-chartjs-2';

class LineClass extends React.Component {
  render() {
    /*
    Props:
      seriesName
      xField
      xFieldLabel
      yField
      yFieldLabel
    */

    let labels = this.props.data.map(item => item[this.props.xField]);

    // Prune half of the labels off

    labels.forEach(function(_, i) {
      if (i % 2 === 1) {
        labels[i] = '';
      }
    });
    return (
      <div>
        <Line
          width={600}
          height={400}
          legend={{ display: false }}
          data={{
            labels,
            datasets: [
              {
                label: this.props.seriesName,
                fill: false,
                lineTension: 0.1,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: 'rgba(75,192,192,1)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 2,
                pointRadius: 2,
                pointHitRadius: 10,
                data: this.props.data.map(item => item[this.props.yField] / 60)
              }
            ]
          }}
          options={{
            responsive: false,
            title: {
              display: true,
              text: this.props.title
            },
            scales: {
              yAxes: [
                {
                  scaleLabel: {
                    display: true,
                    labelString: this.props.yFieldLabel
                  }
                }
              ],
              xAxes: [
                {
                  scaleLabel: {
                    display: true,
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
