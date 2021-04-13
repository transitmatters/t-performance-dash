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
    this.clearMoreOptions = this.clearMoreOptions.bind(this);
    this.setupPickers = this.setupPickers.bind(this);

    this.state = {
      show_date_end_picker: !!this.props.current.date_end,
    };
  }
  
  setupPickers() {
    if (useFlatPickr) {
      // Only initialize once, even after rerenders
      if(!this.picker_start.current._flatpickr) {
        flatpickr(this.picker_start.current, {
          onChange: this.handleSelectDate("date_start"),
          maxDate: 'today',
          minDate: "2016-01-15"
        });
      }
      // Only initialize once, even after rerenders
      if (this.state.show_date_end_picker && !this.picker_end.current._flatpickr) {
        flatpickr(this.picker_end.current, {
          onChange: this.handleSelectDate("date_end"),
          maxDate: 'today',
          minDate: "2016-01-15"
        });
      }
    }
  }

  componentDidMount() {
    this.setupPickers();
  }

  componentDidUpdate(prevProps) {
    this.setupPickers();

    // If the date_end prop shows up because a config preset set it,
    //  then show the end date picker.
    if(this.props.current.date_end !== prevProps.current.date_end) {
      this.setState({
        show_date_end_picker: !!this.props.current.date_end,
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

  clearMoreOptions() {
    this.setState({
      show_date_end_picker: false,
    });
    if(this.picker_end.current._flatpickr) {
      this.picker_end.current._flatpickr.destroy();
    }
    this.props.onConfigurationChange({
      date_end: null,
    });
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
                // Non-standard value comparator because from/to gets copied by onpopstate :/
                optionComparator={o => o.value.stop_name === this.decode("from")?.stop_name}
                defaultLabel="Select a station..."
              />
            </div>
            <div className="option option-to-station">
              <span className="from-to-label">To</span>
              <Select
                value={this.decode("to")}
                options={this.optionsForField("to")}
                onChange={this.handleSelectOption("to")}
                // Non-standard value comparator because from/to gets copied by onpopstate :/
                optionComparator={o => o.value.stop_name === this.decode("to")?.stop_name}
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
              value={this.decode("date_start") || ""} // The || "" is to prevent undefined; that makes React think it's uncontrolled
              onChange={this.handleSelectRawDate("date_start")}
              type='date'
              ref={this.picker_start}
              placeholder='Select date...'
            />
            <input
              className="more-options-button"
              type="button"
              value="Range..."
              style={this.state.show_date_end_picker ? { display: 'none' } : {}}
              onClick={() => this.setState({ show_date_end_picker: true })}
            />
            {!!this.state.show_date_end_picker && <>
              <span className="date-label end-date-label">to</span>
              <input
                value={this.decode("date_end") || ""} // The || "" is to prevent undefined; that makes React think it's uncontrolled
                onChange={this.handleSelectRawDate("date_end")}
                type='date'
                ref={this.picker_end}
                placeholder='Select date...'
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