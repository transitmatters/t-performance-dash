import React from 'react';
import ReactGA from 'react-ga';
import { SingleDaySet, AggregateSet } from './ChartSets';
import StationConfiguration from './StationConfiguration';
import { withRouter } from 'react-router-dom';
import { lookup_station_by_id, get_stop_ids_for_stations } from './stations';
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

const stateFromURL = (pathname, config) => {
  const bus_mode = (pathname === "/bus")
  const [line, from_id, to_id, date_start, date_end] = config.split(",");
  const from = lookup_station_by_id(line, from_id);
  const to = lookup_station_by_id(line, to_id);
  return {
    bus_mode,
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

async function getGitId() {
  const commitTag = document.querySelector(".version");
  let git_id = "unknown";
  try {
    const response = await fetch(APP_DATA_BASE_PATH + '/git_id');
    const commitJson = await response.json();
    git_id = commitJson.git_id;
  }
  catch (error) {
    console.error(`Error fetching Git ID: ${error}`);
  }
  commitTag.style.visibility = "visible";
  commitTag.innerText = "version " + git_id;
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
      this.state.configuration = stateFromURL(this.props.location.pathname, url_config);
      if(!this.permittedRange(this.state.configuration.date_start, this.state.configuration.date_end)) {
        this.state.error_message = RANGE_TOO_LARGE_ERROR;
      }
    }

    if (window.location.hostname !== "dashboard.transitmatters.org") {
      showBetaTag();
    }

    if (window.location.hostname === "localhost") {
      getGitId();
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
    this.isAggregation = this.isAggregation.bind(this);
    this.progressBarRate = this.progressBarRate.bind(this);
    this.restartProgressBar = this.restartProgressBar.bind(this);
    this.permittedRange = this.permittedRange.bind(this);

    this.progressTimer = null;
    this.fetchControllers = [];
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

    if (
      update.configuration.date_end &&
      !this.permittedRange(update.configuration.date_start, update.configuration.date_end)
    ) {
      this.setState({
        error_message: RANGE_TOO_LARGE_ERROR,
      });
      // Setting refetch to false prevents data download, but lets this.state.configuration update still
      refetch = false;
    } else {
      this.setState({
        error_message: null,
      });
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
      bus_mode,
      line,
      from,
      to,
      date_start,
      date_end,
    } = this.state.configuration;
    const { fromStopIds, toStopIds } = get_stop_ids_for_stations(from, to);
    const pathname = bus_mode ? "bus" : "rapidtransit"
    const parts = [
      line,
      fromStopIds?.[0],
      toStopIds?.[0],
      date_start,
      date_end,
    ].map(x => x || "").join(",");
    this.props.history.push(`/${pathname}?config=${parts}`, this.state.configuration);
  }

  fetchDataset(name, signal, options) {
    let url;
    // If a date_end is set, fetch aggregate data instead of single day
    if (this.state.configuration.date_end) {
      options["start_date"] = this.state.configuration.date_start;
      options["end_date"] = this.state.configuration.date_end;

      const method = (name === "traveltimes") ? "traveltimes2" : name;
      url = new URL(`${APP_DATA_BASE_PATH}/aggregate/${method}`, window.location.origin);
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

    fetch(url, {
      signal,
    })
      .then(resp => resp.json())
      .then(data => {
        this.setIsLoadingDataset(name, false);
        this.setState({
          [name]: data
        });
      })
      .catch(e => {
        if(e.name !== "AbortError") {
          console.error(e);
        }
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

  isAggregation() {
    return !!this.state.configuration.date_end;
  }

  restartProgressBar() {
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
          clearInterval(this.progressTimer);
          this.progressTimer = null;
        }
      }, 1000);
    });
  }

  download() {
    // End all existing fetches
    while(this.fetchControllers.length > 0) {
      this.fetchControllers.shift().abort();
    }

    const controller = new AbortController();
    this.fetchControllers.push(controller);

    // Stop existing progress bar timer
    if(this.progressTimer !== null) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }

    const { configuration } = this.state;
    const { fromStopIds, toStopIds } = get_stop_ids_for_stations(configuration.from, configuration.to);
    if (configuration.date_start && fromStopIds && toStopIds) {
      if (configuration.date_end) {
        this.restartProgressBar();
      }

      this.fetchDataset('headways', controller.signal, {
        stop: fromStopIds,
      });
      this.fetchDataset('dwells', controller.signal, {
        stop: fromStopIds,
      });

      if (this.state.configuration.to) {
        this.fetchDataset('traveltimes', controller.signal, {
          from_stop: fromStopIds,
          to_stop: toStopIds,
        });
      }

      if (configuration.line && configuration.date_start && !configuration.date_end) {
        this.setState({
          alerts: null,
        });
        this.fetchDataset('alerts', controller.signal, {
          route: configuration.line,
        });
        ReactGA.pageview(window.location.pathname + window.location.search);
        document.title = documentTitle(this.state.configuration);
      }
    }
  }


  chartTimeframe() {
    // Set alert-bar interval to be 5:30am today to 1am tomorrow.
    const today = `${this.state.configuration.date_start}T00:00:00`;

    let low = new Date(today);
    low.setHours(5, 30)

    let high = new Date(today);
    high.setDate(high.getDate() + 1);
    high.setHours(1,0);

    return [low, high];
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
            const { line, date_start, date_end, from, to } = value;
            this.updateConfiguration({ line, date_start, date_end }, false);
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
    // Single day: no rate
    if(!this.isAggregation()) {
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
    const propsToPass = {
      traveltimes: this.state.traveltimes,
      headways: this.state.headways,
      dwells: this.state.dwells,
      isLoadingTraveltimes: this.getIsLoadingDataset('traveltimes'),
      isLoadingHeadways: this.getIsLoadingDataset('headways'),
      isLoadingDwells: this.getIsLoadingDataset('dwells'),
      startDate: this.state.configuration.date_start,
      endDate: this.state.configuration.date_end,
      from: this.state.configuration.from,
      to: this.state.configuration.to,
      line: this.state.configuration.line
    }
    if (this.isAggregation()) {
      return <AggregateSet {...propsToPass} />
    } else {
      return <SingleDaySet {...propsToPass} />
    }
  }

  render() {
    const { configuration, error_message } = this.state;
    const { from, to, date_start } = configuration;
    const canShowCharts = from && to && !error_message;
    const canShowAlerts = from && to && date_start && !this.isAggregation();
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
          {canShowCharts && !this.getDoneLoading() && this.isAggregation() && <ProgressBar progress={this.state.progress} />}
        </div>
        {!canShowCharts && this.renderEmptyState(error_message)}
        {canShowCharts && this.renderCharts()}
      </div>
    );
  }
}

export default withRouter(App);
