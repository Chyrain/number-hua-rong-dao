import { combineReducers } from "redux";
import current from "./statistics";
import squares from "./board";

const reducers = combineReducers({
  squares,
  current
});

export default reducers;
