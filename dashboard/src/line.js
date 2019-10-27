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
    return (
      <div>
        <Line
          width={1000}
          height={300}
          legend={{ display: false }}
          data={{
            labels,
            datasets: [
              {
                label: this.props.seriesName,
                fill: false,
                lineTension: 0.1,
                borderColor: '#828282',
                borderCapStyle: 'butt',
                borderJoinStyle: 'miter',
                borderWidth: 1,
                pointBorderColor: '#1c1c1c',
                pointBackgroundColor: '#1c1c1c',
                pointBorderWidth: 2,
                pointHoverRadius: 3,
                pointHoverBackgroundColor: 'rgba(75,192,192,0)',
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
                  type: 'time',
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
