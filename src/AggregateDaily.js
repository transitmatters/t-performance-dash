import React from 'react';
import { useState } from 'react';
import classNames from 'classnames';
import { AggregateOverTime } from './line';

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

class AggregateDaily extends React.Component {
  /*
  Props:
    data
    location
    isLoading

  */
  constructor(props) {
    super(props);
    this.onChangeValue = this.onChangeValue.bind(this);

    this.state = {title: 'Aggregate by day (peak)'} //.peak
  }

  options = [{value: "peak", label: "Peak"},
             {value: "offpeak", label: "Off-Peak"}]

  onChangeValue(value) {
    // TODO: set data/field to be peak or offpeak
    if (value === "peak") {
      this.setState({title: "peaking"})
    } else {
      this.setState({title: "not-peaking"})
    }
  }

  render() {
    return(
      <AggregateOverTime
        title={this.state.title}
        data={this.props.data}
        seriesName={this.props.seriesName}
        location={this.props.location}
        titleBothStops={this.props.titleBothStops}
        isLoading={this.props.isLoading}
      >
        <RadioForm onChange={this.onChangeValue}
          options={this.options}
          defaultValue={this.options[0].value}
        />
      </AggregateOverTime>
    )
  }
}

export { AggregateDaily }