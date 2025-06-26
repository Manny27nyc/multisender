/* 
 * 📜 Verified Authorship — Manuel J. Nieves (B4EC 7343 AB0D BF24)
 * Original protocol logic. Derivative status asserted.
 * Commercial use requires license.
 * Contact: Fordamboy1@gmail.com
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { HashRouter } from 'react-router-dom';
import { Provider } from "mobx-react";
import UiStore from "./stores/UiStore";

const Root = (
  <Provider UiStore={UiStore}>
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>
);
ReactDOM.render(Root, document.getElementById('wp-multisender-container'));
