// import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";

import reducers from "./reducers";
import Board from "./containers/Board";

import "./index.scss";

const store = createStore(reducers);
window.store = store;
window.onscroll = function(e) {
  // e.preventDefault();
  // 判断默认行为是否可以被禁用
  if (event.cancelable) {
    // 判断默认行为是否已经被禁用
    if (!event.defaultPrevented) {
      event.preventDefault();
    }
  }
};
document.body.ontouchmove = function(e) {
  if (e.target == document.body) {
    // e.preventDefault();
    // 判断默认行为是否可以被禁用
    if (event.cancelable) {
      // 判断默认行为是否已经被禁用
      if (!event.defaultPrevented) {
        event.preventDefault();
      }
    }
  }
};
document.body.ontouchstart = function(e) {
  console.log("ontouchstart", e, e.target);
  if (e.target == document.body) {
    // e.preventDefault();
    // 判断默认行为是否可以被禁用
    if (event.cancelable) {
      // 判断默认行为是否已经被禁用
      if (!event.defaultPrevented) {
        event.preventDefault();
      }
    }
  }
};

// document.addEventListener(
//   "touchmove",
//   function(e) {
//     // e.preventDefault();
//     // 判断默认行为是否可以被禁用
//     if (event.cancelable) {
//       // 判断默认行为是否已经被禁用
//       if (!event.defaultPrevented) {
//         event.preventDefault();
//       }
//     }
//   },
//   false
// );
// document.addEventListener(
//   "touchstart",
//   function(e) {
//     e.preventDefault();
//   },
//   false
// );

ReactDOM.render(
  <Provider store={store}>
    <Board />
  </Provider>,
  document.getElementById("root")
);
