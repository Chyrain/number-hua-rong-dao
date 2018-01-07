import { getInitialState } from "../lib/game";
const squares = (state = [], action) => {
  console.log("action", action);
  switch (action.type) {
    case "@@redux/INIT":
      return (state = getInitialState(action.level));
    case "BOARD_RESET":
      return (state = getInitialState(action.level));
    case "MOVE_SQUARE":
      state = [].concat(state || []);
      var i = action.from || 0,
        j = action.to || 0;
      var from = state.splice(i, 1, state[j])[0];
      state.splice(j, 1, from);
      state.empty = parseInt(i);
      return state;
    default:
      return state;
  }
};

export default squares;
