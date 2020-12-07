import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import AggregateBeta from './AggregateExperiment';
import OpenSource from './OpenSource';
import { BrowserRouter, Route } from 'react-router-dom';
// import TabContainer from './TabContainer';

ReactDOM.render(<BrowserRouter>
<Route path={["/opensource"]} exact component={OpenSource} />
<Route path={["/aggregate_beta"]} exact component={AggregateBeta} />
<Route path={["/rapidtransit", "/"]} exact component={App} />
</BrowserRouter>, document.getElementById('root'));