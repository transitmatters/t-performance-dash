import React from 'react';
import classNames from 'classnames';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/themes/light.css';

import Select from './Select';
import { all_lines, options_station } from './stations';

const ua = window.navigator.userAgent;
const iOSDevice = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
const useFlatPickr = !iOSDevice;

const options_lines = all_lines().map((line) => {
  return {
    value: line,
    label: line.charAt(0) + line.slice(1) + ' Line',
  }
});

const options_station_ui = (line) => {
  return options_station(line).map((station) => {
    return {
      value: station,
      disabled: station.disabled,
      label: station.stop_name
    }
  }).sort((a, b) => a.value.order - b.value.order)
};

export default class StationConfiguration extends React.Component {
  constructor(props) {
    super(props);
    this.picker_start = React.createRef();
    this.picker_end = React.createRef();
    this.handleSelectDate = this.handleSelectDate.bind(this);
    this.handleSelectRawDate = this.handleSelectRawDate.bind(this);
    this.handleSwapStations = this.handleSwapStations.bind(this);

    this.state = {
      show_date_end_picker: !!this.props.current.date_end,
    };
  }

  componentDidMount() {
    if (useFlatPickr) {
      flatpickr(this.picker_start.current, {
        onChange: this.handleSelectDate("date_start"),
        maxDate: 'today',
        minDate: "2016-01-15"
      });
      flatpickr(this.picker_end.current, {
        onChange: this.handleSelectDate("date_end"),
        maxDate: 'today',
        minDate: "2016-01-15"
      });
    }
  }

  handleSelectDate(field_name) {
    return (_, dateStr, __) => {
      this.props.onConfigurationChange({
        [field_name]: dateStr
      });
    };
  }

  handleSelectRawDate(field_name) {
    return (evt) => {
      this.props.onConfigurationChange({
        [field_name]: evt.target.value
      });
    }
  }

  handleSelectOption(field) {
    return (value) => {
      this.props.onConfigurationChange({
        [field]: value,
      });
    };
  }

  handleSwapStations() {
    const fromValue = this.decode("from");
    const toValue = this.decode("to");
    this.props.onConfigurationChange({
      from: toValue,
      to: fromValue
    });
  }

  decode(property) {
    return this.props.current[property];
  }

  optionsForField(type) {
    if (type === "line") {
      return options_lines;
    }
    if (type === "from") {
      const toStation = this.decode("to");
      return options_station_ui(this.props.current.line).filter(entry => entry.value !== toStation);
    }
    if (type === "to") {
      const fromStation = this.decode("from");
      return options_station_ui(this.props.current.line).filter(({ value }) => {
        if (value === fromStation) {
          return false;
        }
        if (fromStation && fromStation.branches && value.branches) {
          return value.branches.some(entryBranch => fromStation.branches.includes(entryBranch));
        }
        return true
      });
    }

  }

  render() {
    const currentLine = this.decode("line");
    return (
      <div className={classNames('station-configuration-wrapper', currentLine)}>
        <div className="station-configuration main-column">
          <div className="option option-line">
            <Select
              value={this.decode("line")}
              options={this.optionsForField("line")}
              onChange={this.handleSelectOption("line")}
              defaultLabel="Select a line..."
            />
          </div>

          <div className="option-group option-stations-group">
            <div className="option option-from-station">
              <span className="from-to-label">From</span>
              <Select
                value={this.decode("from")}
                options={this.optionsForField("from")}
                onChange={this.handleSelectOption("from")}
                defaultLabel="Select a station..."
              />
            </div>
            <div className="option option-to-station">
              <span className="from-to-label">To</span>
              <Select
                value={this.decode("to")}
                options={this.optionsForField("to")}
                onChange={this.handleSelectOption("to")}
                defaultLabel="Select a station..."
              />
            </div>
          </div>
          <button className="swap-stations-button" onClick={this.handleSwapStations} disabled={!currentLine}>
            <div className="swap-icon" />
            <div className="swap-label">Swap</div>
          </button>
          <div className="option option-date">
            <span className="date-label">Date:</span>
            <input
              value={this.decode("date_start")}
              onChange={useFlatPickr ? undefined : this.handleSelectRawDate("date_start")}
              type='date'
              ref={this.picker_start}
              placeholder='Select date...'
            />
             <span style={this.state.show_date_end_picker ? {} : { display: 'none' }}>
              <span className="date-label">to</span>
              <input
                value={this.decode("date_end")}
                onChange={useFlatPickr ? undefined : this.handleSelectRawDate("date_end")}
                type='date'
                ref={this.picker_end}
                placeholder='Select date...'
              />
            </span>
          </div>
          <div className="option option-date">

          </div> 
          <div className="option">
          <input
              type="button"
              value="More options..."
              style={this.state.show_date_end_picker ? { display: 'none' } : {}}
              onClick={() => this.setState({show_date_end_picker: true})}
              />
          </div>
        </div>
      </div>
    );
  }
}