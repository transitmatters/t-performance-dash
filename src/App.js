import React from 'react';
import Line from './line';
import StationConfiguration from './StationConfiguration';
import { withRouter } from 'react-router-dom';
import { lookup_station_by_id } from './stations';
import { recognize } from './AlertFilter';
import AlertBar from './AlertBar';
import './App.css';

const APP_DATA_BASE_PATH = (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1") ?
  '' : 'https://dashboard-api.transitmatters.org';

const stateFromURL = (config) => {
  const [ line, direction, from_id, to_id, date, show_alerts ] = config.split(",");
  const from = lookup_station_by_id(from_id);
  const to = lookup_station_by_id(to_id);
  return {
    line,
    direction,
    from,
    to,
    date,
    show_alerts: show_alerts === 'true',
  }
};

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      configuration: {
        show_alerts: true,
      },
      headways: [],
      traveltimes: [],
      dwells: [],

      alerts: [],
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
    this.chartTimeframe = this.chartTimeframe.bind(this);
  }

  componentDidMount() {
    this.download();
  }

  updateConfiguration(config_change, refetch) {
    let update = {
      configuration: {
        ...this.state.configuration,
        ...config_change
      }
    };
    if (config_change.line && config_change.line !== this.state.configuration.line) {
      update.configuration.from = null;
      update.configuration.to = null;
      update.headways = [];
      update.traveltimes = [];
      update.dwells = [];
    }
    this.setState(update, () => {
      this.stateToURL();
      if (refetch) {
        this.download();
      }
    });
  }

  stateToURL() {
    const { line, direction, from, to, date, show_alerts } = this.state.configuration;
    this.props.history.push(`/rapidtransit?config=${line || ""},${direction || ""},${from?.stop_id || ""},${to?.stop_id || ""},${date || ""},${show_alerts}`, this.state.configuration);
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

      if (this.state.configuration.line && this.state.configuration.date) {
        this.setState({
          alerts: null,
        });
        this.fetchDataset('alerts', {
          route: this.state.configuration.line,
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
      return `${prefix} at ${from.stop_name},${direction_display}`;
    }
    return prefix;
  }

  chartTimeframe() {
    const travel_times = this.state.traveltimes;
    if (travel_times.length > 0) {
      return [new Date(travel_times[0].dep_dt), new Date(travel_times[travel_times.length - 1].dep_dt)];
    }
    return [];
  }

  render() {
    const recognized_alerts = this.state.alerts?.filter(recognize);
    return (
      <div className='App'>
        <div id='options'>
          <StationConfiguration current={this.state.configuration} onConfigurationChange={this.updateConfiguration} />
        </div>
        <div className='right-container'>
          {this.state.configuration.show_alerts &&
            <AlertBar
            alerts={recognized_alerts}
            timeframe={this.chartTimeframe()}
            />
          }
          <div className='charts'>
            <Line
              title={this.graphTitle('Travel times', this.state.configuration.from, this.state.configuration.to, this.state.configuration.direction)}
              tooltipUnit={"travel time"}
              seriesName={'traveltimes'}
              data={this.state.traveltimes}
              xField={'dep_dt'}
              xFieldLabel={'Time of day'}
              yField={'travel_time_sec'}
              yFieldLabel={'Minutes'}
              benchmarkField={'benchmark_travel_time_sec'}
              alerts={this.state.configuration.show_alerts ? recognized_alerts : []}
              legend={true}
            />

            <Line
              title={this.graphTitle('Time between trains (headways)', this.state.configuration.from, null, this.state.configuration.direction)}
              tooltipUnit={"headway"}
              seriesName={'headways'}
              data={this.state.headways}
              xField={'current_dep_dt'}
              xFieldLabel={'Time of day'}
              yField={'headway_time_sec'}
              yFieldLabel={'Minutes'}
              benchmarkField={'benchmark_headway_time_sec'}
              alerts={this.state.configuration.show_alerts ? recognized_alerts : []}
              legend={true}
            />

            <Line
              title={this.graphTitle('Time spent at station (dwells)', this.state.configuration.from, null, this.state.configuration.direction)}
              tooltipUnit={"dwell time"}
              seriesName={'dwells'}
              data={this.state.dwells}
              xField={'arr_dt'}
              xFieldLabel={'Time of day'}
              yField={'dwell_time_sec'}
              yFieldLabel={'Minutes'}
              benchmarkField={null}
              alerts={this.state.configuration.show_alerts ? recognized_alerts : []}
            />
            </div>
        </div>
      </div>
    );
  }
}

export default withRouter(App);
