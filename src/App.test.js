import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// TODO: This test seems unused, jest or rtl aren't on the install list
// eslint-disable-next-line no-undef
it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
