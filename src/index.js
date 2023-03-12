import React from 'react';
import ReactDOM from 'react-dom';
import { datadogRum } from '@datadog/browser-rum';
import './index.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import App from './App';
import { OpenSource } from './OpenSource';
import { SlowZones } from './slowzones/SlowZones';

datadogRum.init({
  applicationId: process.env.REACT_APP_DATADOG_APP_ID,
  clientToken: process.env.REACT_APP_DATADOG_CLIENT_TOKEN,
  site: 'datadoghq.com',
  service: process.env.REACT_APP_NAME,
  version: process.env.REACT_APP_VERSION,
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
});
datadogRum.startSessionReplayRecording();

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route exact path="/opensource">
        <OpenSource />
      </Route>
      <Route exact path="/">
        <App bus_mode={false} />
      </Route>
      <Route exact path="/rapidtransit">
        <App bus_mode={false} />
      </Route>
      <Route exact path="/bus">
        <App bus_mode={true} />
      </Route>
      <Route exact path="/slowzones">
        <SlowZones />
      </Route>
    </Switch>
  </BrowserRouter>,
  document.getElementById('root')
);
