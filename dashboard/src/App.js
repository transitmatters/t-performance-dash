import React from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/themes/material_red.css';
import Line from './line';
import './App.css';

const APP_DATA_BASE_PATH = '/t-performance-dash/puller';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.flatpickr = React.createRef();

    this.state = {
      selectedDate: '',
      headways: [],
      traveltimes: [],
      dwells: []
    };

    this.download = this.download.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
  }

  componentDidMount() {
    flatpickr(this.flatpickr.current, {
      onChange: this.onDateChange
    });
  }

  fetchDataset(name) {
    fetch(`${APP_DATA_BASE_PATH}/${name}/${this.state.selectedDate}`)
        .then(resp => resp.json())
        .then(data => {
          this.setState({
            [name]: data
          });
        });
  }

  download() {
    if (this.state.selectedDate !== '') {
      this.fetchDataset('headways');
      this.fetchDataset('traveltimes');
      this.fetchDataset('dwells');
    }
  }

  onDateChange(_, dateStr, __) {
    this.setState(
      {
        selectedDate: dateStr
      },
      () => {
        this.download();
      }
    );
  }

  render() {
    return (
      <div className='App'>
        <div className='picker_station'>
        </div>

        <div className='picker_date'>
          Select date:{' '}
          <input type='date' ref={this.flatpickr} placeholder='Select date...' />
        </div>
        
        <div className='charts'>
          <Line
            title={'Travel Times'}
            data={this.state.traveltimes}
            xField={'arr_dt'}
            xFieldLabel={'Time of day'}
            yField={'travel_time_sec'}
            yFieldLabel={'Minutes'}
            seriesName={'Harvard to South'}
          />

          <Line
            title={'Headways'}
            data={this.state.headways}
            xField={'current_dep_dt'}
            xFieldLabel={'Time of day'}
            yField={'headway_time_sec'}
            yFieldLabel={'Minutes'}
            seriesName={'Harvard to South'}
          />

          <Line
            title={'Dwell Times'}
            data={this.state.dwells}
            xField={'arr_dt'}
            xFieldLabel={'Time of day'}
            yField={'dwell_time_sec'}
            yFieldLabel={'Minutes'}
            seriesName={'Harvard to South'}
          />  
        </div>
      </div>
    );
  }
}
