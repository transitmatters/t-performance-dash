import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter, Route } from 'react-router-dom';
// import TabContainer from './TabContainer';

ReactDOM.render(<BrowserRouter>
<Route path={["/rt/:config", "/"]} component={App} />
</BrowserRouter>, document.getElementById('root'));