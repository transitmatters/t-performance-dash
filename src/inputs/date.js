import React from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/themes/light.css';

const ua = window.navigator.userAgent;
const isMobile = /Android|webOS|iPhone|iPad|BlackBerry|IEMobile|Opera Mini/i.test(ua);
const useFlatPickr = !isMobile;

const RegularDateInput = (props) => {
  let maxDate = props.options.maxDate;
  if (maxDate === "today") {
    const iso_date = new Date();
    const offset = iso_date.getTimezoneOffset();
    const local_date = new Date(iso_date.valueOf() - (offset * 60 * 1000));
    maxDate = local_date.toISOString().split("T")[0];
  }

  return(
    <input
      type="date"
      value={props.value}
      onChange={(evt) => props.onChange(evt.target.value)}
      placeholder={props.placeholder}
      min={props.options.minDate}
      max={maxDate}
    />
  )
}

class Flatpickr extends React.Component {
  /***
  * We got some confusing stuff going on here.
  * Flatpickr is gonna control some DOM stuff, but we want it to go where React tells it
  * So we use a Ref: 
  *   - this.node is the DOM element where we'll put the flatpickr.
  *   - this.flatpickr is the flatpickr instance. We have to update it when props change.
  * Since flatpickr is doing lots of control of the <input> field,
  * Let's give React as little info/control for it as possible.
  */
  constructor(props) {
    super(props);
    this.node = null;
    this.flatpickr = null;
    this.createFlatpickr = this.createFlatpickr.bind(this);
    this.destroyFlatpickr = this.destroyFlatpickr.bind(this);
    this.handleNodeChange = this.handleNodeChange.bind(this);
  }

  createFlatpickr = () => {
    this.flatpickr = flatpickr(this.node,
      {
        date: this.props.value,
        onChange: (sel, dateStr, inst) => this.props.onChange(dateStr),
        ...this.props.options
      });
  }

  destroyFlatpickr = () => {
    this.flatpickr?.destroy();
    this.flatpickr = null;
  }

  handleNodeChange = (node) => {
    this.node = node;
    if (node) {
      this.destroyFlatpickr();
      this.createFlatpickr();
    }
  }

  componentDidMount() {
    this.createFlatpickr();
  }

  componentDidUpdate() {
    this.flatpickr.setDate(this.props.value)
    this.flatpickr.set("minDate", this.props.options.minDate);
    this.flatpickr.set("maxDate", this.props.options.maxDate);
    // this.flatpickr.set("defaultDate", this.props.defaultValue);
    // this.flatpickr.jumpToDate(this.props.value || this.props.defaultValue);
  }

  componentWillUnmount() {
    this.destroyFlatpickr();
  }

  render() {
    return(
      <input
        type="date"
        readOnly={true}
        placeholder={this.props.placeholder}
        ref={this.handleNodeChange}
      />
    );
  }
}

const DatePicker = (props) => {
  if (useFlatPickr) {
    return(<Flatpickr {...props} />);
  } else {
    return(<RegularDateInput {...props} />);
  }
}

export default DatePicker;