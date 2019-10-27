import React from 'react';
import flatpickr from 'flatpickr';
import Select from 'react-select'
import 'flatpickr/dist/themes/material_red.css';
import Line from './line';
import { lines } from './constants';
import './App.css';

const APP_DATA_BASE_PATH = (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1") ?
  '' : '/t-performance-dash/puller';

const lineSelectOptions = lines.map((line) => {
  return {
    value: line.name,
    label: line.name_human_readable
  }
});

const stationOptionsForLine = (line) => {
  if (line) {
    const lineObject = lines.find((i) => i.name === line.value);
    return Object.entries(lineObject.stop_ids).map((entry) => {
      return {
        label: entry[0],
        value: entry[1],
      }
    });
  }
  else {
    return [];
  }
};

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.flatpickr = React.createRef();

    this.state = {
      selectedDate: null,
      selectedLine: null,
      selectedStationFrom: null,
      selectedStationTo: null,

      headways: [],
      traveltimes: [],
      dwells: []
    };

    this.download = this.download.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onLineChange = this.onLineChange.bind(this);
    this.onStationFromChange = this.onStationFromChange.bind(this);
    this.onStationToChange = this.onStationToChange.bind(this);
  }

  componentDidMount() {
    flatpickr(this.flatpickr.current, {
      onChange: this.onDateChange
    });
  }

  fetchDataset(name, options) {
    let url = new URL(`${APP_DATA_BASE_PATH}/${name}/${this.state.selectedDate}`, window.location.origin);
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
    if (this.state.selectedDate) {
      if (this.state.selectedStationFrom) {
        this.fetchDataset('headways', {
          station: this.state.selectedStationFrom.value,
        });
        this.fetchDataset('dwells', {
          station: this.state.selectedStationFrom.value,
        });
      }

      if (this.state.selectedStationFrom && this.state.selectedStationTo) {
        let from = this.state.selectedStationFrom.value;
        let to = this.state.selectedStationTo.value;

        // Major hack so we don't have to hard code all of the NB stop ids...
        if (to < from) {
          to++;
          from++;
        }

        this.fetchDataset('traveltimes', {
          station_from: from,
          station_to: to,
        });
      }

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

  onLineChange(line) {
    this.setState({
      selectedLine: line
    });
  }

  onStationFromChange(station) {
    this.setState({
      selectedStationFrom: station
    }, () => {
      this.download();
    });
  }

  onStationToChange(station) {
    this.setState({
      selectedStationTo: station
    }, () => {
      this.download();
    });
  }

  render() {
    return (
      <div className='App'>
        <div id='options'>
          <div className="option">
            <div className='picker-line'>
              Line<Select options={lineSelectOptions} onChange={this.onLineChange} />
            </div>
          </div>

          <div className="option">
            <div className='picker-station'>
              From<Select options={stationOptionsForLine(this.state.selectedLine)} onChange={this.onStationFromChange} /> to <Select options={stationOptionsForLine(this.state.selectedLine)} onChange={this.onStationToChange} />
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
            data={this.state.traveltimes}
            xField={'arr_dt'}
            xFieldLabel={'Time of day'}
            yField={'travel_time_sec'}
            yFieldLabel={'Minutes'}
          />

          <Line
            title={'Headways'}
            data={this.state.headways}
            xField={'current_dep_dt'}
            xFieldLabel={'Time of day'}
            yField={'headway_time_sec'}
            yFieldLabel={'Minutes'}
          />

          <Line
            title={'Dwell Times'}
            data={this.state.dwells}
            xField={'arr_dt'}
            xFieldLabel={'Time of day'}
            yField={'dwell_time_sec'}
            yFieldLabel={'Minutes'}
          />
        </div>
      </div>
    );
  }
}
