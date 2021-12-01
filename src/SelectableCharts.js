import React from 'react';
import { useState } from 'react';
import classNames from 'classnames';
import { AggregateByTime, AggregateByDate } from './line';

const RadioForm = props => {
  const { options, onChange, defaultValue, className } = props;
  const [ checked, setChecked ] = useState(defaultValue);

  const handleChange = (evt) => {
    const value = evt.target.value;
    setChecked(value);
    onChange(evt.target.value);
  }

  return (
    <div className={classNames("control", className)}>
      {options.map((opt, index) => 
        <label key={index}>
          <input type="radio"
            value={opt.value}
            onChange={handleChange}
            checked={opt.value === checked}/>
          {opt.label}
        </label>
        )}
    </div>
  )
}

class AggregateByTimeSelectable extends React.Component {
  /*
  Props:
    data
    location
    isLoading

  */
  constructor(props) {
    super(props);
    this.onChangeValue = this.onChangeValue.bind(this);

    this.state = {
      title: `${props.title} (Weekday)`,
      selected: "weekday"
    }
  }

  options = [
    {value: "weekday", label: "Weekday", titleSuffix: "(Weekday)"},
    {value: "weekend", label: "Weekend/Holiday", titleSuffix: "(Weekend/Holiday)"}
  ]

  onChangeValue(value) {
    let titleSuffix = this.options.find(x => x.value === value).titleSuffix
    this.setState({
      title: `${this.props.title} ${titleSuffix}`,
      selected: value
    })
  }

  render() {
    return(
      <AggregateByTime
        title={this.state.title}
        data={this.props.data.filter(x => x.is_peak_day === (this.state.selected === "weekday"))}
        seriesName={this.props.seriesName}
        location={this.props.location}
        titleBothStops={this.props.titleBothStops}
        isLoading={this.props.isLoading}
      >
        <RadioForm onChange={this.onChangeValue}
          options={this.options}
          defaultValue={this.state.selected}
        />
      </AggregateByTime>
    )
  }
}

class AggregateByDateSelectable extends React.Component {
  /*
  Props:
    data
    location
    isLoading

  */
  constructor(props) {
    super(props);
    this.onChangeValue = this.onChangeValue.bind(this);

    this.state = {
      title: props.title,
      selected: "all"
    }
  }

  options = [
    {value: "all", label: "All times", titleSuffix: ""},
    {value: "am_peak", label: "AM Peak", titleSuffix: "(AM Peak only)"},
    {value: "pm_peak", label: "PM Peak", titleSuffix: "(PM Peak only)"},
    {value: "off_peak", label: "Off-peak", titleSuffix: "(Off-peak only)"}
  ]

  onChangeValue(value) {
    const titleSuffix = this.options.find(x => x.value === value).titleSuffix || ""
    this.setState({
      title: `${this.props.title} ${titleSuffix}`,
      selected: value
    })
  }

  render() {
    return(
      <AggregateByDate
        title={this.state.title}
        data={this.props.data.filter(x => x.peak === this.state.selected)}
        seriesName={this.props.seriesName}
        location={this.props.location}
        titleBothStops={this.props.titleBothStops}
        isLoading={this.props.isLoading}
        startDate={this.props.startDate}
        endDate={this.props.endDate}
      >
        <RadioForm onChange={this.onChangeValue}
          options={this.options}
          defaultValue={this.state.selected}
        />
      </AggregateByDate>
    )
  }
}

export { AggregateByDateSelectable, AggregateByTimeSelectable }
