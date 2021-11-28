import React from 'react';
import { useState } from 'react';
import classNames from 'classnames';
import { AggregateDailyLine } from './line';

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

    this.state = {
      title: `${props.title} (Work days)`,
      selected: "workdays"
    }
  }

  options = [{value: "workdays", label: "Work days"},
             {value: "weekends", label: "Weekends/Holidays"}]

  onChangeValue(value) {
    if (value === "workdays") {
      this.setState({
        title: `${this.props.title} (Work days)`,
        selected: value
      })
    } else {
      this.setState({
        title: `${this.props.title} (Weekends)`,
        selected: value
      })
    }
  }

  render() {
    return(
      <AggregateDailyLine
        title={this.state.title}
        data={this.props.data?.[this.state.selected] || []}
        seriesName={this.props.seriesName}
        location={this.props.location}
        titleBothStops={this.props.titleBothStops}
        isLoading={this.props.isLoading}
      >
        <RadioForm onChange={this.onChangeValue}
          options={this.options}
          defaultValue={this.state.selected}
        />
      </AggregateDailyLine>
    )
  }
}

export { AggregateDaily }