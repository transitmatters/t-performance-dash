import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import OpenSource from './OpenSource';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

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
    </Switch>
  </BrowserRouter>,
document.getElementById('root'));
