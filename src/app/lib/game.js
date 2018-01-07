var seed = 0;
//[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]
// 指定位置分配[目前采用随机方案，暂未用此方案]
const levels = [
  [8, 11, 3, 5, 9, 15, 2, 7, 0, 13, 1, 10, 14, 6, 12, 4],
  [7, 10, 2, 4, 8, 14, 1, 13, 15, 12, 0, 9, 3, 5, 11, 6],
  [9, 12, 14, 6, 10, 0, 13, 5, 1, 15, 8, 2, 7, 11, 4, 3],
  [10, 13, 15, 7, 11, 1, 14, 6, 2, 0, 9, 3, 8, 12, 5, 4],
  [7, 11, 14, 9, 13, 6, 10, 3, 0, 8, 4, 12, 15, 1, 5, 2]
];

function inArray(n, arr) {
  return arr.indexOf(n);
}

function getRandomArr(Min, Max) {
  var array = new Array();
  var cha = Max - Min;
  for (var i = 0; ; i++) {
    if (array.length < cha) {
      // 产生随机数 0到count不包含count的随机数
      var randomNub = Min + Math.floor(Math.random() * cha);
      // 判断数组array中是否包含元素randomNub
      if (-1 == inArray(randomNub, array)) {
        array.push(randomNub);
      }
    } else {
      break;
    }
  }
  return array;
}

function getArray(lvl) {
  if (lvl) return levels[seed++ % 5];
  return getRandomArr(0, 16);
}

// 各棋子的初始值
function getInitialState(level) {
  var arr = getArray(level),
    result = [];
  for (var i = 0; i < 16; i++) {
    arr[i] === 0 && (result.empty = i);
    result.push({
      num: arr[i],
      position: {
        x: i % 4,
        y: Math.floor(i / 4)
      }
    });
  }
  return result;
}

function canMove(id, move, emptyId) {
  const { x, y } = { x: id % 4, y: Math.floor(id / 4) };
  if (
    (x + move.x === emptyId % 4 && y === Math.floor(emptyId / 4)) ||
    (x === emptyId % 4 && y + move.y === Math.floor(emptyId / 4))
  ) {
    return true;
  }
  return false;
}

function checkWin(data) {
  if (data.empty !== 15) {
    return false;
  } else {
    for (var i = 0; i < 15; i++) {
      if (data[i].num !== i + 1) {
        return false;
      }
    }
    return true;
  }
}

function formatTime(second) {
  return parseInt(second / 60 / 60)
    ? [parseInt(second / 60 / 60), parseInt(second / 60) % 60, second % 60]
        .join(":")
        .replace(/\b(\d)\b/g, "0$1")
    : [parseInt(second / 60) % 60, second % 60]
        .join(":")
        .replace(/\b(\d)\b/g, "0$1");
}

export { getInitialState, canMove, checkWin, formatTime };
