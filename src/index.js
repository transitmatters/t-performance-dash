import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import OpenSource from './OpenSource';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { SlowZones } from './slowzones/SlowZones';
import { Rankings } from './rankings/Rankings';

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route exact path="/opensource" >
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
      <Route exact path="/rankings">
        <Rankings />
      </Route>
    </Switch>
  </BrowserRouter>,
document.getElementById('root'));
