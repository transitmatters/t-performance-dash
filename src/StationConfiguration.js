import React, { useRef, useEffect } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/themes/material_blue.css';
import { all_lines, options_station, options_direction } from './stations';

const options_lines = all_lines().map((line) => {
  return {
    value: line,
    label: line.charAt(0) + line.slice(1) + ' Line',
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

const Select = props => {
  const { options, onChange, defaultLabel = "" } = props;
  const elementRef = useRef(null);

  const handleChange = (evt) => {
    console.log(options[evt.target.value]);
    onChange(options[evt.target.value]);
  }

  return <select ref={elementRef} onChange={handleChange} className="option-select">
    <option value="default" selected disabled hidden>{defaultLabel}</option>
    {options.map((option, index) => <option value={index} key={index}>{option.label}</option>)}
  </select>
}

export default class StationConfiguration extends React.Component {
  constructor(props) {
    super(props);
    this.flatpickr = React.createRef();

    this.handleSelectDate = this.handleSelectDate.bind(this);
    this.toggleAlerts = this.toggleAlerts.bind(this);
  }

  componentDidMount() {
    flatpickr(this.flatpickr.current, {
      onChange: this.handleSelectDate,
      maxDate: 'today',
      minDate: '2015-06-01',
    });
  }

  handleSelectDate(_, dateStr, __) {
    this.props.onConfigurationChange({
      date: dateStr
    }, true);
  }

  handleSelectOption(field) {
    return (change) => {
      this.props.onConfigurationChange({
        [field]: change.value,
      }, true);
    };
  }

  toggleAlerts() {
    this.props.onConfigurationChange({
      show_alerts: !this.props.current.show_alerts,
    }, false);
  }

  decode(property) {
    return this.props.current[property] || null;
  }

  optionsForField(type) {
    if (type === "line") {
      return options_lines;
    }
    if (type === "from") {
      return options_station_ui(this.props.current.line);
    }
    if (type === "to") {
      return options_station_ui(this.props.current.line);
    }
  }

  render() {
    const currentLine = this.decode("line");
    return (
      <div className='station-configuration'>
        <div className="option option-line">
          <Select
            options={this.optionsForField("line")}
            onChange={this.handleSelectOption("line")}
            defaultLabel="Select a line..."
          />
        </div>

        <div className="option-group option-stations-group">
          <div className="option option-from-station" key={`from-${currentLine}`}>
            <span className="from-to-label">From</span>
            <Select
              className="option option-select"
              options={this.optionsForField("from")}
              onChange={this.handleSelectOption("from")}
            />
          </div>
          <div className="option option-to-station" key={`to-${currentLine}`}>
            <span className="from-to-label">To</span>
            <Select
              classname="option-select"
              options={this.optionsForField("to")}
              onChange={this.handleSelectOption("to")}
            />
          </div>
        </div>

        <div className="option option-date">
          <span className="date-label">Date</span>
          <input
            defaultValue={this.decode("date")}
            onChange={() => { }} type='date'
            ref={this.flatpickr}
            placeholder='Select date...'
          />
        </div>
      </div>
    );
  }
}