import React from 'react';
import flatpickr from 'flatpickr';
import Select from 'react-select'
import 'flatpickr/dist/themes/material_blue.css';
import Line from './line';
import { all_lines, options_station, options_direction } from './stations';
import './App.css';

const APP_DATA_BASE_PATH = (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1") ?
  '' : '/t-performance-dash/puller';


const options_lines = all_lines().map((line) => {
  console.log(`options_lines()`)
  return {
    value: line,
    label: line
  }
});

const options_direction_ui = (line) => options_direction(line).map((direction) => {
  console.log(`Processing direction option: ${direction}`);
  return {
    value: direction,
    label: direction
  }
});

const options_station_ui = (line, direction, from) => {
  return options_station(line, direction, from).map((station) => {
    console.log(`Processing station option: ${station}`);
    return {
      value: station,
      label: station.stop_name
    }
  })
};


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.flatpickr = React.createRef();

    this.state = {
      date: null,
      line: null,
      direction: null,
      from: null,
      to: null,

      options_direction: null,
      options_from: null,
      options_to: null,

      headways: [],
      traveltimes: [],
      dwells: []
    };

    this.download = this.download.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onLineChange = this.onLineChange.bind(this);
    this.onDirectionChange = this.onDirectionChange.bind(this);
    this.onStationFromChange = this.onStationFromChange.bind(this);
    this.onStationToChange = this.onStationToChange.bind(this);
  }

  onDateChange(_, dateStr, __) {
    this.setState(
      {
        date: dateStr
      },
      () => {
        this.download();
      }
    );
  }

  onLineChange(line) {
    this.setState({
      line: line.value,
      options_direction: options_direction_ui(line.value)
    });
  }

  onDirectionChange(direction) {
    this.setState({
      direction: direction.value,
      options_from: options_station_ui(this.state.line, direction.value, null)
    });
  }

  onStationFromChange(station) {
    this.setState({
      options_to: options_station_ui(this.state.line, this.state.direction, this.state.from),
      from: station.value
    }, () => {
      this.download();
    });
  }

  onStationToChange(station) {
    this.setState({
      to: station.value
    }, () => {
      this.download();
    });
  }

  componentDidMount() {
    flatpickr(this.flatpickr.current, {
      onChange: this.onDateChange
    });
  }

  fetchDataset(name, options) {
    let url = new URL(`${APP_DATA_BASE_PATH}/${name}/${this.state.date}`, window.location.origin);
    Object.keys(options).forEach(key => url.searchParams.append(key, options[key]));

    fetch(url)
      .then(resp => resp.json())
      .then(data => {
        this.setState({
          [name]: data
        });
      });
  }

  download() {
    if (this.state.date && this.state.direction && this.state.from) {
      console.log("this.state.from: ", this.state.from);
      this.fetchDataset('headways', {
        station: this.state.from.stop_id,
      });
      this.fetchDataset('dwells', {
        station: this.state.from.stop_id,
      });
      this.fetchDataset('traveltimes', {
        station_from: this.state.from.stop_id,
        station_to: this.state.to.stop_id,
      });
    }
  }

  render() {
    return (
      <div className='App'>
        <div id='options'>
          <div className="option">
            <div className='picker-line'>
              Line<Select options={options_lines} onChange={this.onLineChange} />
            </div>
            <div className='picker-direction'>
              Direction<Select options={this.state.options_direction} onChange={this.onDirectionChange} />
            </div>
          </div>

          <div className="option">
            <div className='picker-station'>
              From<Select options={this.state.options_from} onChange={this.onStationFromChange} /> to <Select options={this.state.options_to} onChange={this.onStationToChange} />
            </div>
          </div>

          <div className="option">
            <div className='picker-date'>
              Date <input type='date' ref={this.flatpickr} placeholder='Select date...' />
            </div>
          </div>
        </div>

        <div className='charts'>
          <Line
            title={'Travel Times'}
            seriesName={'traveltimes'}
            data={this.state.traveltimes}
            xField={'arr_dt'}
            xFieldLabel={'Time of day'}
            yField={'travel_time_sec'}
            yFieldLabel={'Minutes'}
            benchmarkField={'benchmark_travel_time_sec'}
          />

          <Line
            title={'Headways'}
            seriesName={'headways'}
            data={this.state.headways}
            xField={'current_dep_dt'}
            xFieldLabel={'Time of day'}
            yField={'headway_time_sec'}
            yFieldLabel={'Minutes'}
            benchmarkField={'benchmark_headway_time_sec'}
          />

          <Line
            title={'Dwell Times'}
            seriesName={'dwells'}
            data={this.state.dwells}
            xField={'arr_dt'}
            xFieldLabel={'Time of day'}
            yField={'dwell_time_sec'}
            yFieldLabel={'Minutes'}
            benchmarkField={null}
          />
        </div>
      </div>
    );
  }
}
