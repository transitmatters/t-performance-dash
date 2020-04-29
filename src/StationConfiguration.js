import React from 'react';
import Select from 'react-select';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/themes/material_blue.css';
import { all_lines, options_station, options_direction } from './stations';

const options_lines = all_lines().map((line) => {
  return {
    value: line,
    label: line
  }
});

const options_direction_ui = (line) => options_direction(line).map((direction) => {
  return {
    value: direction,
    label: direction
  }
});

const options_station_ui = (line, direction, from) => {
  return options_station(line, direction, from).map((station) => {
    return {
      value: station,
      label: station.stop_name
    }
  })
};

export default class StationConfiguration extends React.Component {
  constructor(props) {
    super(props);
    this.flatpickr = React.createRef();

    this.handleSelectDate = this.handleSelectDate.bind(this);
  }

  componentDidMount() {
    flatpickr(this.flatpickr.current, {
      onChange: this.handleSelectDate
    });
  }

  handleSelectDate(_, dateStr, __) {
    this.props.onConfigurationChange({
      date: dateStr
    });
  }

  handleSelectOption(field) {
    return (change) => {
      this.props.onConfigurationChange({
        [field]: change.value,
      });
    };
  }

  decode(property) {
    if (!this.props.current[property]) {
      return null;
    }

    if (property === "line" || property === "direction") {
      return {
        value: this.props.current[property],
        label: this.props.current[property]
      }
    }
    else if (property === "date") {
      return this.props.current[property];
    }
    else return {
      value: this.props.current[property],
      label: this.props.current[property].stop_name,
    }
  }

  optionsForField(type) {
    if (type === "line") {
      return options_lines;
    }
    if (type === "direction" && this.props.current.line) {
      return options_direction_ui(this.props.current.line);
    }
    if (type === "from" && this.props.current.direction) {
      return options_station_ui(this.props.current.line, this.props.current.direction, null);
    }
    if (type === "to" && this.props.current.from) {
      return options_station_ui(this.props.current.line, this.props.current.direction, this.props.current.from);
    }
  }

  render() {
    return (
      <div>
        <div className="option">
          <div className='picker-line'>
            Line<Select value={this.decode("line")} options={this.optionsForField("line")} onChange={this.handleSelectOption("line")} />
          </div>
          <div className='picker-direction'>
            Direction<Select value={this.decode("direction")} options={this.optionsForField("direction")} onChange={this.handleSelectOption("direction")} />
          </div>
        </div>

        <div className="option">
          <div className='picker-station'>
            From<Select value={this.decode("from")} options={this.optionsForField("from")} onChange={this.handleSelectOption("from")} /> to <Select value={this.decode("to")} options={this.optionsForField("to")} onChange={this.handleSelectOption("to")} />
          </div>
        </div>

        <div className="option">
          <div className='picker-date'>
            Date <input defaultValue={this.decode("date")} onChange={() => {}} type='date' ref={this.flatpickr} placeholder='Select date...' />
          </div>
        </div>
      </div>
    );
  }
}