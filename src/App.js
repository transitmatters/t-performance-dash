import React from 'react';
import Line from './line';
import StationConfiguration from './StationConfiguration';
import { withRouter } from 'react-router-dom';
import { lookup_station_by_id, station_direction, get_stop_ids_for_stations } from './stations';
import { recognize } from './AlertFilter';
import AlertBar from './AlertBar';
import './App.css';

const APP_DATA_BASE_PATH = (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1") ?
  '' : 'https://dashboard-api.transitmatters.org';

const stateFromURL = (config) => {
  const [line, from_id, to_id, date] = config.split(",");
  const from = lookup_station_by_id(line, from_id);
  const to = lookup_station_by_id(line, to_id);
  return {
    line,
    from,
    to,
    date,
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
    const { line, from, to, date, } = this.state.configuration;
    const parts = [
      line,
      from?.stops.southbound,
      to?.stops.southbound,
      date
    ].map(x => x || "").join(",");
    this.props.history.push(`/rapidtransit?config=${parts}`, this.state.configuration);
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
    const {configuration} = this.state;
    const {fromStopId, toStopId} = get_stop_ids_for_stations(configuration.from, configuration.to);
    if (configuration.date && fromStopId && toStopId) {
      this.fetchDataset('headways', {
        station: fromStopId,
      });
      this.fetchDataset('dwells', {
        station: fromStopId,
      });

      if (this.state.configuration.to) {
        this.fetchDataset('traveltimes', {
          station_from: fromStopId,
          station_to: toStopId,
        });
      }

      if (configuration.line && configuration.date) {
        this.setState({
          alerts: null,
        });
        this.fetchDataset('alerts', {
          route: configuration.line,
        });
      }
    }
  }

  graphTitle(prefix, showDirection) {
    const {from, to, line} = this.state.configuration;
    if (from && to) {
      const direction = showDirection ? ` ${station_direction(from, to, line)}` : ""
      return `${prefix} from ${from.station_name}${direction} to ${to.station_name}`;
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
    const { configuration } = this.state;
    const recognized_alerts = this.state.alerts?.filter(recognize);
    return (
      <div className='App'>
        <div className="top-sticky-container">
          <StationConfiguration current={configuration} onConfigurationChange={this.updateConfiguration} />
          <AlertBar alerts={recognized_alerts} timeframe={this.chartTimeframe()} />
        </div>
        <div className='charts main-column'>
          <Line
            title={this.graphTitle('Travel times')}
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
            title={this.graphTitle('Time between trains (headways)', true)}
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
            title={this.graphTitle('Time spent at station (dwells)', true)}
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
    );
  }
}

export default withRouter(App);
