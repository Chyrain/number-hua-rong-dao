let nextTodoId = 0;

export const resetBoard = lvl => ({
  type: "BOARD_RESET",
  level: lvl
});

export const moveSquare = (from, to) => ({
  type: "MOVE_SQUARE",
  from: from,
  to: to
});
