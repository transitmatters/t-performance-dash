import React from 'react';
import App from './App';

export default class TabContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: 0,
    };
  }

  render() {
    return (
      <div className="tabs tabs is-centered is-boxed">
      <ul>
        <li className="is-active">
          <a>
            <span>Time Metrics</span>
          </a>
        </li>
        <li>
          <a>
            <span>Route Stringlines</span>
          </a>
        </li>
      </ul>
    </div>
    );
  }
}