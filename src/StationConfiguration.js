import React, { useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/themes/light.css';
import { all_lines, options_station } from './stations';

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
      label: station.station_name
    }
  })
};

const Select = props => {
  const { options, onChange, defaultLabel = "", value } = props;
  const elementRef = useRef(null);

  const handleChange = (evt) => {
    onChange(options[evt.target.value]);
  }

  const matchingIndex = options.findIndex(o => o.value === value);

  return <select
    className="option-select"
    ref={elementRef}
    onChange={handleChange}
    disabled={options.length === 0}
    value={matchingIndex === -1 ? "default" : matchingIndex}
  >
    <option value="default" disabled hidden>{defaultLabel}</option>
    {options.map((option, index) =>
      <option
        value={index}
        key={index}
      >
        {option.label}
      </option>
    )}
  </select>
}

export default class StationConfiguration extends React.Component {
  constructor(props) {
    super(props);
    this.flatpickr = React.createRef();

    this.handleSelectDate = this.handleSelectDate.bind(this);
    this.toggleAlerts = this.toggleAlerts.bind(this);
    this.handleSwapStations = this.handleSwapStations.bind(this);
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

  handleSwapStations() {
    const fromValue = this.decode("from");
    const toValue = this.decode("to");
    this.props.onConfigurationChange({
      from: toValue,
      to: fromValue
    }, true);
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
      const toStation = this.decode("to");
      return options_station_ui(this.props.current.line).filter(entry => entry.value !== toStation);
    }
    if (type === "to") {
      const fromStation = this.decode("from");
      return options_station_ui(this.props.current.line).filter(entry => entry.value !== fromStation);
    }
  }

  render() {
    const currentLine = this.decode("line");
    return (
      <div className='station-configuration-wrapper'>
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
                className="option option-select"
                value={this.decode("from")}
                options={this.optionsForField("from")}
                onChange={this.handleSelectOption("from")}
                defaultLabel="Select a station..."
              />
            </div>
            <div className="option option-to-station">
              <span className="from-to-label">To</span>
              <Select
                classname="option-select"
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
            <span className="date-label">Date</span>
            <input
              defaultValue={this.decode("date")}
              onChange={() => { }} type='date'
              ref={this.flatpickr}
              placeholder='Select date...'
            />
          </div>
        </div>
      </div>
    );
  }
}