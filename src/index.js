import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import OpenSource from './OpenSource';
import { BrowserRouter, Route } from 'react-router-dom';
// import TabContainer from './TabContainer';

ReactDOM.render(<BrowserRouter>
<Route path={["/opensource"]} exact component={OpenSource} />
<Route path={["/rapidtransit", "/"]} exact component={App} />
</BrowserRouter>, document.getElementById('root'));