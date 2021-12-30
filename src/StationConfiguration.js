import React from 'react';
import classNames from 'classnames';

import DatePicker from './inputs/date';
import Select from './inputs/Select';
import './inputs/toggle.css';

import { bus_lines, subway_lines, options_station, line_name } from './stations';
import { busDateRange, trainDateRange } from './constants';


const options_lines = (is_bus) => {
  const lines = is_bus ? bus_lines() : subway_lines();
  return lines.map((line) => {
    return {
      value: line,
      label: line_name(line)
    }
  });
};

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
    this.handleBusToggle = this.handleBusToggle.bind(this);
    this.handleSelectOption = this.handleSelectOption.bind(this);
    this.handleSwapStations = this.handleSwapStations.bind(this);
    this.clearMoreOptions = this.clearMoreOptions.bind(this);

    this.state = {
      show_date_end_picker: !!this.props.current.date_end,
    };
  }
  

  componentDidUpdate(prevProps) {
    // If the date_end prop shows up because a config preset set it,
    //  then show the end date picker.
    if(this.props.current.date_end !== prevProps.current.date_end) {
      this.setState({
        show_date_end_picker: !!this.props.current.date_end,
      });
    }
  }

  handleBusToggle() {
    this.props.onConfigurationChange({
      bus_mode: !this.getVal("bus_mode"),
      line: null,
      date_start: null,
      date_end: null
    }, false);
  }

  handleSelectOption(field) {
    return (value) => {
      this.props.onConfigurationChange({
        [field]: value,
      });
    };
  }

  handleSwapStations() {
    const fromValue = this.getVal("from");
    const toValue = this.getVal("to");
    this.props.onConfigurationChange({
      from: toValue,
      to: fromValue
    });
  }

  getVal(property) {
    return this.props.current[property];
  }

  optionsForField(type) {
    if (type === "line") {
      return options_lines(this.getVal("bus_mode"));
    }
    if (type === "from") {
      const toStation = this.getVal("to");
      return options_station_ui(this.props.current.line).filter(entry => entry.value !== toStation);
    }
    if (type === "to") {
      const fromStation = this.getVal("from");
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

  clearMoreOptions() {
    this.setState({
      show_date_end_picker: false,
    });
    this.props.onConfigurationChange({
      date_end: null,
    });
  }

  render() {
    const currentLine = this.getVal("line");
    const bus_mode = this.getVal("bus_mode");
    const availableDates = bus_mode ? busDateRange : trainDateRange;
    return (
      <div className={classNames('station-configuration-wrapper',
                                  bus_mode ? "Bus" : currentLine)}>
        <div className="station-configuration main-column">
          
          <div className="option option-mode">
            <span className="switch-label">Subway</span>
            <label className="option switch">
              <input type="checkbox" checked={bus_mode} onChange={this.handleBusToggle}/>
              <span className="slider"></span>
            </label>
            <span className="switch-label">Bus</span>
          </div>

          <div className="option option-line">
            <Select
              value={this.getVal("line")}
              options={this.optionsForField("line")}
              onChange={this.handleSelectOption("line")}
              defaultLabel={bus_mode ? "Select a route..." : "Select a line..."}
            />
          </div>

          <div className="option-group option-stations-group">
            <div className="option option-from-station">
              <span className="from-to-label">From</span>
              <Select
                value={this.getVal("from")}
                options={this.optionsForField("from")}
                onChange={this.handleSelectOption("from")}
                // Non-standard value comparator because from/to gets copied by onpopstate :/
                optionComparator={o => o.value.stop_name === this.getVal("from")?.stop_name}
                defaultLabel="Select a station..."
              />
            </div>
            <div className="option option-to-station">
              <span className="from-to-label">To</span>
              <Select
                value={this.getVal("to")}
                options={this.optionsForField("to")}
                onChange={this.handleSelectOption("to")}
                // Non-standard value comparator because from/to gets copied by onpopstate :/
                optionComparator={o => o.value.stop_name === this.getVal("to")?.stop_name}
                defaultLabel="Select a station..."
              />
            </div>
          </div>
          <button className="swap-stations-button" onClick={this.handleSwapStations} disabled={!currentLine}>
            <div className="swap-icon" />
            <div className="swap-label">Swap</div>
          </button>
          <div className="option option-date">
            <span className="date-label">Date</span>
            <DatePicker
              value={this.getVal("date_start") || ""}
              onChange={this.handleSelectOption("date_start")}
              options={availableDates}
              placeholder="Select date..."
            />
            <button
              className="more-options-button"
              style={this.state.show_date_end_picker ? { display: 'none' } : {}}
              onClick={() => this.setState({ show_date_end_picker: true })}
            >Range...</button>
            {!!this.state.show_date_end_picker && <>
              <span className="date-label end-date-label">to</span>
              <DatePicker
                value={this.getVal("date_end") || ""}
                onChange={this.handleSelectOption("date_end")}
                options={availableDates}
                placeholder="Select date..."
              />
              <button
                className="clear-button"
                style={{ visibility: this.state.show_date_end_picker ? 'visible' : 'hidden' }}
                onClick={this.clearMoreOptions}
              >🅧</button>
            </>
            }
          </div>
        </div>
      </div>
    );
  }
}