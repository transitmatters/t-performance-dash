import React from "react";
import './ProgressBar.css';

function progressBarRate(date_start, date_end) {
  // Single day: no rate
  if(!date_end) {
    return null;
  }
  // Aggregation: fake rate based on how many days
  const ms = (new Date(date_end) - new Date(date_start));
  const days = ms / (1000*60*60*24);
  const months = days / 30;
  const total_seconds_expected = 3.0 * months;
  return 100 / total_seconds_expected;
}


class ProgressBar extends React.Component{
  /**
   * This is now a completely uncontrolled component.
   * Once mounted, it will run until 95% or it's unmounted.
   * key is used by App.js to make React mount a new one each time.
   * props: rate, key
   */
  constructor(props) {
    super(props);
    this.timer = null;
    this.state = {
      progress: 0
    }
  }

  componentDidMount() {
    this.startTimer();
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  startTimer() {
    // shouldn't be necessary to reset, but just in case
    this.stopTimer();
    this.setState({
      progress: 0,
    });
    this.timer = setInterval(
      () => this.tick(),
      1000
    );
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = null;
  }

  tick() {
    this.setState((state, props) => {
      const newProgress = state.progress + props.rate;
      if (newProgress < 95) {
        return { progress: newProgress };
      } else {
        this.stopTimer();
        return { progress: 95 };
      }
    });
  }

  render() {
    return (
      <div className="progress-bar"
        style={{width: `${this.state.progress}%`}}
      />
    )
  }
}

export { ProgressBar, progressBarRate };
