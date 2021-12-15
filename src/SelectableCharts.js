import React from 'react';
import classNames from 'classnames';
import { AggregateByTime, AggregateByDate } from './line';

const RadioForm = (props) => {
  const { options, onChange, checked, className } = props;

  return (
    <div className={classNames("control", className)}>
      {options.map((opt, index) => 
        <label key={index}>
          <input type="radio"
            value={opt.value}
            onChange={evt => onChange(evt.target.value)}
            checked={opt.value === checked}/>
          {opt.label}
        </label>
        )}
    </div>
  )
}

const dayOptions = [
  {value: "weekday", label: "Weekday", titleSuffix: "(Weekday)"},
  {value: "weekend", label: "Weekend/Holiday", titleSuffix: "(Weekend/Holiday)"}
]

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

  onChangeValue(value) {
    let titleSuffix = dayOptions.find(x => x.value === value).titleSuffix
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
          options={dayOptions}
          checked={this.state.selected}
        />
      </AggregateByTime>
    )
  }
}


const peakOptions = [
  {value: "all", label: "All times", titleSuffix: ""},
  {value: "am_peak", label: "AM Peak", titleSuffix: "(AM Peak only)"},
  {value: "pm_peak", label: "PM Peak", titleSuffix: "(PM Peak only)"},
  {value: "off_peak", label: "Off-peak", titleSuffix: "(Off-peak only)"}
]

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

  onChangeValue(value) {
    const titleSuffix = peakOptions.find(x => x.value === value).titleSuffix || ""
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
          options={peakOptions}
          checked={this.state.selected}
        />
      </AggregateByDate>
    )
  }
}

export { AggregateByDateSelectable, AggregateByTimeSelectable }
