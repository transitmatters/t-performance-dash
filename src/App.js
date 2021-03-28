import React from 'react';
import ReactGA from 'react-ga';
import Line from './line';
import StationConfiguration from './StationConfiguration';
import { withRouter } from 'react-router-dom';
import { lookup_station_by_id, station_direction, get_stop_ids_for_stations } from './stations';
import { recognize } from './AlertFilter';
import AlertBar from './AlertBar';
import ProgressBar from './ui/ProgressBar';
import './App.css';
import Select from './Select';
import { configPresets } from './constants';

const FRONTEND_TO_BACKEND_MAP = new Map([
  ["localhost", ""], // this becomes a relative path that is proxied through CRA:3000 to python on :5000
  ["127.0.0.1", ""],
  ["dashboard.transitmatters.org", "https://dashboard-api2.transitmatters.org"],
  ["dashboard-beta.transitmatters.org", "https://dashboard-api-beta.transitmatters.org"]
]);
const APP_DATA_BASE_PATH = FRONTEND_TO_BACKEND_MAP.get(window.location.hostname);

const MAX_AGGREGATION_MONTHS = 8;
const RANGE_TOO_LARGE_ERROR = `Please select a range no larger than ${MAX_AGGREGATION_MONTHS} months.`;

const stateFromURL = (config) => {
  const [line, from_id, to_id, date_start, date_end] = config.split(",");
  const from = lookup_station_by_id(line, from_id);
  const to = lookup_station_by_id(line, to_id);
  return {
    line,
    from,
    to,
    date_start,
    date_end,
  }
};

const documentTitle = (config) => {
  return `${config.line} Line - ${config.date_start} - TransitMatters Data Dashboard`;
};

const showBetaTag = () => {
  const beta_tag = document.querySelector(".beta-tag");
  beta_tag.style.visibility = "visible";
  beta_tag.innerText = "Beta";
};

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      configuration: {
        show_alerts: true,
      },
      error_message: null,
      headways: [],
      traveltimes: [],
      dwells: [],
      alerts: [],
      datasetLoadingState: {},

      progress: 0,
    };

    ReactGA.initialize("UA-71173708-2");
    ReactGA.pageview("/rapidtransit");

    const url_config = new URLSearchParams(props.location.search).get("config");
    if (typeof url_config === "string") {
      this.state.configuration = stateFromURL(url_config);
      if(!this.permittedRange(this.state.configuration.date_start, this.state.configuration.date_end)) {
        this.state.error_message = RANGE_TOO_LARGE_ERROR;
      }
    }

    if (window.location.hostname !== "dashboard.transitmatters.org") {
      showBetaTag();
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
    this.setIsLoadingDataset = this.setIsLoadingDataset.bind(this);
    this.getIsLoadingDataset = this.getIsLoadingDataset.bind(this);
    this.getDoneLoading = this.getDoneLoading.bind(this);
    this.getTimescale = this.getTimescale.bind(this);
    this.progressBarRate = this.progressBarRate.bind(this);
    this.restartProgressBar = this.restartProgressBar.bind(this);
    this.permittedRange = this.permittedRange.bind(this);

    this.progressTimer = null;
  }

  componentDidMount() {
    this.download();
  }

  permittedRange(date_start, date_end) {
    const date_start_ts = new Date(date_start).getTime();
    const date_end_ts = new Date(date_end).getTime();
    if(
      date_end_ts < date_start_ts ||
      date_end_ts - date_start_ts > MAX_AGGREGATION_MONTHS * 30 * 86400 * 1000
      ) {
      return false;
    }
    return true;
  }

  updateConfiguration(config_change, refetch = true) {
    let update = {
      error: null,
      configuration: {
        ...this.state.configuration,
        ...config_change
      }
    };
    
    if(update.configuration.date_end) {
      if(!this.permittedRange(update.configuration.date_start, update.configuration.date_end)) {
        this.setState({
          error_message: RANGE_TOO_LARGE_ERROR,
        });
        // Setting refetch to false prevents data download, but lets this.state.configuration update still
        refetch = false;
      }
      else {
        this.setState({
          error_message: null,
        });
      }
    }
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
    const {
      line,
      from,
      to,
      date_start,
      date_end,
    } = this.state.configuration;
    const parts = [
      line,
      from?.stops.southbound,
      to?.stops.southbound,
      date_start,
      date_end,
    ].map(x => x || "").join(",");
    this.props.history.push(`/rapidtransit?config=${parts}`, this.state.configuration);
  }

  fetchDataset(name, options) {
    let url;
    // If a date_end is set, fetch aggregate data instead of single day
    if (this.state.configuration.date_end) {
      options["start_date"] = this.state.configuration.date_start;
      options["end_date"] = this.state.configuration.date_end;
      url = new URL(`${APP_DATA_BASE_PATH}/aggregate/${name}`, window.location.origin);
    }
    else {
      url = new URL(`${APP_DATA_BASE_PATH}/${name}/${this.state.configuration.date_start}`, window.location.origin);
    }
    Object.entries(options).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(subvalue => url.searchParams.append(key, subvalue))
      } else {
        url.searchParams.append(key, value);
      }
    });

    this.setIsLoadingDataset(name, true);

    fetch(url)
      .then(resp => resp.json())
      .then(data => {
        this.setIsLoadingDataset(name, false);
        this.setState({
          [name]: data
        });
      });
  }

  getDoneLoading() {
    let all_done = true;
    for (const [, isLoading] of Object.entries(this.state.datasetLoadingState)) {
      if (isLoading) {
        all_done = false;
      }
    }
    return all_done;
  }

  setIsLoadingDataset(name, isLoading) {
    this.setState(currentState => {
      const { datasetLoadingState } = currentState;
      return {
        datasetLoadingState: {
          ...datasetLoadingState,
          [name]: isLoading
        }
      }
    });
  }

  getIsLoadingDataset(name) {
    return this.state.datasetLoadingState[name];
  }

  getTimescale() {
    if (this.state.configuration.date_end) {
      return "day";
    }
    return "hour";
  }

  restartProgressBar() {
    if(this.progressTimer !== null) {
      clearTimeout(this.progressTimer);
      this.progressTimer = null;
    }

    // Start the progress bar at 0
    this.setState({
      progress: 0,
    }, () => {
      this.progressTimer = setInterval(() => {
        // Increment up until 85%
        if(this.state.progress < 85) {
          this.setState({
            progress: this.state.progress + this.progressBarRate(),
          });
        }
        else {
          // Stop at 90%, the progress bar will be cleared when everything is actually done loading
          clearTimeout(this.progressTimer);
        }
      }, 1000);
    });
  }

  download() {
    const { configuration } = this.state;
    const { fromStopIds, toStopIds } = get_stop_ids_for_stations(configuration.from, configuration.to);
    if (configuration.date_start && fromStopIds && toStopIds) {
      this.restartProgressBar();

      this.fetchDataset('headways', {
        stop: fromStopIds,
      });
      this.fetchDataset('dwells', {
        stop: fromStopIds,
      });

      if (this.state.configuration.to) {
        this.fetchDataset('traveltimes', {
          from_stop: fromStopIds,
          to_stop: toStopIds,
        });
      }

      if (configuration.line && configuration.date_start && !configuration.date_end) {
        this.setState({
          alerts: null,
        });
        this.fetchDataset('alerts', {
          route: configuration.line,
        });
        ReactGA.pageview(window.location.pathname + window.location.search);
        document.title = documentTitle(this.state.configuration);
      }
    }
  }

  locationDescription(bothStops) {
    const { from, to, line } = this.state.configuration;

    if (from && to) {
      return {
        bothStops: bothStops,
        to: to.stop_name,
        from: from.stop_name,
        direction: station_direction(from, to, line),
        line: line,
      };
    }
    return {};
  }

  chartTimeframe() {
    const travel_times = this.state.traveltimes;
    if (travel_times.length > 0) {
      return [new Date(travel_times[0].dep_dt), new Date(travel_times[travel_times.length - 1].dep_dt)];
    }
    return [];
  }

  componentDidCatch(error) {
    this.setState(currentState => {
      const { configuration } = currentState;
      return {
        error_message: error,
        configuration: {
          ...configuration,
          to: null,
          from: null,
        }
      }
    });
  }

  renderEmptyState(error_message) {
    return <div className="main-column">
      <div className="empty-state">
        {error_message && <>{error_message}</>}
        {!error_message && <>See MBTA rapid transit performance data, including travel times between stations, headways,
        and dwell times, for any given day. <span style={{fontWeight: "bold"}}>Select a line, station pair, and date above to get started.</span><div style={{marginTop: 10}}>Looking for something interesting? <span style={{fontWeight: "bold"}}>Try one of these dates:</span></div>
        <Select
          onChange={value => {
            const { line, date_start, from, to } = value;
            this.updateConfiguration({ line, date_start }, false);
            setTimeout(() => this.updateConfiguration({ from, to }));
          }}
          options={configPresets}
          className="date-selector"
          defaultLabel="Choose a date..."
        />
        </>}
      </div>
    </div>
  }

  progressBarRate() {
    const is_aggregation = this.getTimescale() === 'hour';
    // Single day: no rate
    if(is_aggregation) {
      return null;
    }

    // Aggregation: fake rate based on how many days
    const {date_start, date_end} = this.state.configuration;
    const ms = (new Date(date_end) - new Date(date_start));
    const days = ms / (1000*60*60*24);
    const months = days / 30;

    const total_seconds_expected = 3.0 * months;
    return 100 / total_seconds_expected; // % per second
  }

  renderCharts() {
    const timescale = this.getTimescale();
    const is_aggregation = timescale === 'hour';
    return <div className='charts main-column'>
      <Line
        title={"Travel times"}
        location={this.locationDescription(true)}
        tooltipUnit={"travel time"}
        timescale={timescale}
        seriesName={is_aggregation ? 'travel time' : 'travel time (median)'}
        isLoading={this.getIsLoadingDataset('traveltimes')}
        data={this.state.traveltimes}
        xField={is_aggregation ? 'dep_dt' : 'service_date'}
        xFieldLabel={is_aggregation ? 'Time of day' : 'Day'}
        xFieldUnit={timescale}
        yField={is_aggregation ? 'travel_time_sec' : '50%'}
        yFieldLabel={is_aggregation ? 'Minutes' : 'Minutes (median)'}
        benchmarkField={'benchmark_travel_time_sec'}
      />
      <Line
        title={'Time between trains (headways)'}
        location={this.locationDescription(false)}
        tooltipUnit={"headway"}
        timescale={timescale}
        seriesName={is_aggregation ? 'headways' : 'headways (median)'}
        isLoading={this.getIsLoadingDataset('headways')}
        data={this.state.headways}
        xField={is_aggregation ? 'current_dep_dt' : 'service_date'}
        xFieldLabel={is_aggregation ? 'Time of day' : 'Day'}
        xFieldUnit={timescale}
        yField={is_aggregation ? 'headway_time_sec' : '50%'}
        yFieldLabel={is_aggregation ? 'Minutes' : 'Minutes (median)'}
        benchmarkField={'benchmark_headway_time_sec'}
      />
      <Line
        title={'Time spent at station (dwells)'}
        location={this.locationDescription(false)}
        tooltipUnit={"dwell time"}
        timescale={timescale}
        seriesName={is_aggregation ? 'dwell times' : 'dwell times (median)'}
        isLoading={this.getIsLoadingDataset('dwells')}
        data={this.state.dwells}
        xField={is_aggregation ? 'arr_dt' : 'service_date'}
        xFieldLabel={is_aggregation ? 'Time of day' : 'Day'}
        xFieldUnit={timescale}
        yField={is_aggregation ? 'dwell_time_sec' : '50%'}
        yFieldLabel={is_aggregation ? 'Minutes' : 'Minutes (median)'}
        benchmarkField={null}
      />
    </div>
  }

  render() {
    const { configuration, error_message } = this.state;
    const { from, to, date_start } = configuration;
    const canShowCharts = from && to && !error_message;
    const canShowAlerts = from && to && date_start && this.getTimescale() === 'hour';
    const recognized_alerts = this.state.alerts?.filter(recognize);
    const hasNoLoadedCharts = ['traveltimes', 'dwells', 'headways']
      .every(kind => this.getIsLoadingDataset(kind));

    return (
      <div className='App'>
        <div className="top-sticky-container">
          <StationConfiguration current={configuration} onConfigurationChange={this.updateConfiguration} />
          {canShowAlerts && <AlertBar
            alerts={recognized_alerts}
            timeframe={this.chartTimeframe()}
            isLoading={this.getIsLoadingDataset("alerts")}
            isHidden={hasNoLoadedCharts}
          />}
          {canShowCharts && !this.getDoneLoading() && <ProgressBar progress={this.state.progress} />}
        </div>
        {!canShowCharts && this.renderEmptyState(error_message)}
        {canShowCharts && this.renderCharts()}
      </div>
    );
  }
}

export default withRouter(App);
