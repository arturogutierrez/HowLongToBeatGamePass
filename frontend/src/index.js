import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
// Fonts
import WebFont from 'webfontloader';
// Web vitals
import reportWebVitals from './reportWebVitals';

import './assets/index.css';
import App from './app/App';
import { store } from './app/store';

function initializeFonts() {
  WebFont.load({
    google: {
      families: ['Roboto:300,400,500,700', 'Roboto Slab:400,700', 'Material Icons'],
    },
  });
}

function renderApplication() {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root'),
  );
}

initializeFonts();
renderApplication();
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
