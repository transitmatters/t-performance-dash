import React from 'react';
import Line from './line';
import StationConfiguration from './StationConfiguration';
import PermalinkButton from './PermalinkButton';
import { withRouter } from 'react-router-dom';
import { lookup_station_by_id } from './stations';
import './App.css';

const APP_DATA_BASE_PATH = (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1") ?
  '' : 'https://dashboard-api.transitmatters.org';

const stateFromURL = (config) => {
  const [ line, direction, from_id, to_id, date ] = config.split(",");
  const from = lookup_station_by_id(from_id);
  const to = lookup_station_by_id(to_id);
  return {
    line,
    direction,
    from,
    to,
    date
  }
};

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      configuration: {},
      headways: [],
      traveltimes: [],
      dwells: []
    };

    const url_config = new URLSearchParams(props.location.search).get("config");
    if (typeof url_config === "string") {
      this.state.configuration = stateFromURL(url_config);
    }

    // Handle back/forward buttons
    window.onpopstate = (e) => {
      this.setState({
        configuration: e.state.state,
      }, () => {
        this.download();
      });
    };

    this.download = this.download.bind(this);
    this.updateConfiguration = this.updateConfiguration.bind(this);
  }

  componentDidMount() {
    this.download();
  }

  updateConfiguration(config_change) {
    this.setState({
      configuration: {
        ...this.state.configuration,
        ...config_change
      }
    }, () => {
      this.stateToURL();
      this.download();
    });
  }

  stateToURL() {
    const { line, direction, from, to, date } = this.state.configuration;
    this.props.history.push(`/rapidtransit?config=${line || ""},${direction || ""},${from?.stop_id || ""},${to?.stop_id || ""},${date || ""}`, this.state.configuration);
  }

  fetchDataset(name, options) {
    let url = new URL(`${APP_DATA_BASE_PATH}/${name}/${this.state.configuration.date}`, window.location.origin);
    Object.keys(options).forEach(key => url.searchParams.append(key, options[key]));

    fetch(url)
      .then(resp => resp.json())
      .then(data => {
        this.setState({
          [name]: data
        });
      });
  }

  download() {
    if (this.state.configuration.date && this.state.configuration.direction && this.state.configuration.from) {
      this.fetchDataset('headways', {
        station: this.state.configuration.from.stop_id,
      });
      this.fetchDataset('dwells', {
        station: this.state.configuration.from.stop_id,
      });
      
      if (this.state.configuration.to) {
        this.fetchDataset('traveltimes', {
          station_from: this.state.configuration.from.stop_id,
          station_to: this.state.configuration.to.stop_id,
        });
      }
    }
  }

  graphTitle(prefix, from, to, direction) {
    const direction_display = direction ? ` ${direction}bound` : "";
    if(from && to) {
      return `${prefix} from ${from.stop_name} to ${to.stop_name}`;
    }
    else if(from) {
      return `${prefix} at ${from.stop_name}${direction_display}`;
    }
    return prefix;
  }

  render() {
    return (
      <div className='App'>
        <div id='options'>
          <StationConfiguration current={this.state.configuration} onConfigurationChange={this.updateConfiguration} />
          <PermalinkButton />
        </div>

        <div className='charts'>
          <Line
            title={this.graphTitle('Travel times', this.state.configuration.from, this.state.configuration.to, this.state.configuration.direction)}
            seriesName={'traveltimes'}
            data={this.state.traveltimes}
            xField={'arr_dt'}
            xFieldLabel={'Time of day'}
            yField={'travel_time_sec'}
            yFieldLabel={'Minutes'}
            benchmarkField={'benchmark_travel_time_sec'}
          />

          <Line
            title={this.graphTitle('Time between trains', this.state.configuration.from, null, this.state.configuration.direction)}
            seriesName={'headways'}
            data={this.state.headways}
            xField={'current_dep_dt'}
            xFieldLabel={'Time of day'}
            yField={'headway_time_sec'}
            yFieldLabel={'Minutes'}
            benchmarkField={'benchmark_headway_time_sec'}
          />

          <Line
            title={this.graphTitle('Time spent at station', this.state.configuration.from, null, this.state.configuration.direction)}
            seriesName={'dwells'}
            data={this.state.dwells}
            xField={'arr_dt'}
            xFieldLabel={'Time of day'}
            yField={'dwell_time_sec'}
            yFieldLabel={'Minutes'}
            benchmarkField={null}
          />
        </div>
      </div>
    );
  }
}

export default withRouter(App);
// export default App;