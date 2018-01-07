const current = (state = {}, action) => {
  switch (action.type) {
    case "@@redux/INIT":
      return (state = { count: 0 });
    case "BOARD_RESET":
      return (state = { count: 0 });
    case "MOVE_SQUARE":
      state = Object.assign({}, state);
      state.count || (state.count = 0);
      state.count++;
      return state;
    default:
      return state;
  }
};

export default current;
