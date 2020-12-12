import React from 'react';
import ReactGA from 'react-ga';
import Line from './line';
import StationConfiguration from './StationConfiguration';
import { withRouter } from 'react-router-dom';
import { lookup_station_by_id, station_direction, get_stop_ids_for_stations } from './stations';
import { recognize } from './AlertFilter';
import AlertBar from './AlertBar';
import './App.css';
import Select from './Select';
import { configPresets } from './constants';

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

const documentTitle = (config) => {
  return `${config.line} Line - ${config.date} - TransitMatters Data Dashboard`;
};

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      configuration: {
        show_alerts: true,
      },
      error: null,
      headways: [],
      traveltimes: [],
      dwells: [],
      alerts: [],
      datasetLoadingState: {},
    };

    ReactGA.initialize("UA-71173708-2");
    ReactGA.pageview("/rapidtransit");

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
    this.setIsLoadingDataset = this.setIsLoadingDataset.bind(this);
    this.getIsLoadingDataset = this.getIsLoadingDataset.bind(this);
  }

  componentDidMount() {
    this.download();
  }

  updateConfiguration(config_change, refetch = true) {
    let update = {
      error: null,
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

  download() {
    const { configuration } = this.state;
    const { fromStopIds, toStopIds } = get_stop_ids_for_stations(configuration.from, configuration.to);
    if (configuration.date && fromStopIds && toStopIds) {
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

      if (configuration.line && configuration.date) {
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
        error,
        configuration: {
          ...configuration,
          to: null,
          from: null,
        }
      }
    });
  }

  renderEmptyState(withError) {
    return <div className="main-column">
      <div className="empty-state">
        {withError && <>There was an error loading data for this date. Maybe try one of these?</>}
        {!withError && <>See MBTA rapid transit performance data, including travel times between stations, headways,
        and dwell times, for any given day. <span style={{fontWeight: "bold"}}>Select a line, station pair, and date above to get started.</span><div style={{marginTop: 10}}>Looking for something interesting? <span style={{fontWeight: "bold"}}>Try one of these dates:</span></div></>}
        <Select
          onChange={value => {
            const { line, date, from, to } = value;
            this.updateConfiguration({ line, date }, false);
            setTimeout(() => this.updateConfiguration({ from, to }));
          }}
          options={configPresets}
          className="date-selector"
          defaultLabel="Choose a date..."
        />
      </div>
    </div>
  }

  renderCharts() {
    return <div className='charts main-column'>
      <Line
        title={"Travel times"}
        location={this.locationDescription(true)}
        tooltipUnit={"travel time"}
        seriesName={'traveltimes'}
        isLoading={this.getIsLoadingDataset('traveltimes')}
        data={this.state.traveltimes}
        xField={'dep_dt'}
        xFieldLabel={'Time of day'}
        yField={'travel_time_sec'}
        yFieldLabel={'Minutes'}
        benchmarkField={'benchmark_travel_time_sec'}
        legend={true}
      />
      <Line
        title={'Time between trains (headways)'}
        location={this.locationDescription(false)}
        tooltipUnit={"headway"}
        seriesName={'headways'}
        isLoading={this.getIsLoadingDataset('headways')}
        data={this.state.headways}
        xField={'current_dep_dt'}
        xFieldLabel={'Time of day'}
        yField={'headway_time_sec'}
        yFieldLabel={'Minutes'}
        benchmarkField={'benchmark_headway_time_sec'}
        legend={true}
      />
      <Line
        title={'Time spent at station (dwells)'}
        location={this.locationDescription(false)}
        tooltipUnit={"dwell time"}
        seriesName={'dwells'}
        isLoading={this.getIsLoadingDataset('dwells')}
        data={this.state.dwells}
        xField={'arr_dt'}
        xFieldLabel={'Time of day'}
        yField={'dwell_time_sec'}
        yFieldLabel={'Minutes'}
        benchmarkField={null}
      />
    </div>
  }

  render() {
    const { configuration, error } = this.state;
    const { from, to, date } = configuration;
    const canShowCharts = from && to && !error;
    const canShowAlerts = from && to && date;
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
        </div>
        {!canShowCharts && this.renderEmptyState(error)}
        {canShowCharts && this.renderCharts()}
      </div>
    );
  }
}

export default withRouter(App);
