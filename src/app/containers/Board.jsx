import { connect } from "react-redux";
import { resetBoard, moveSquare } from "../actions";
import React from "react";
import Square from "../components/Square.jsx";
import Swipeable from "react-swipeable";
import { canMove, checkWin, formatTime } from "../lib/game";

const countStyle = {
  fontSize: "36px",
  position: "relative",
  top: "6px",
  color: "#666",
  margin: "0 6px"
};
const timeStyle = {
  fontSize: "20px",
  position: "relative",
  top: "1px",
  color: "#666"
};
const tipsStyle = {
  color: "rgb(210, 210, 210)"
};

class Board extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      timer: 0,
      start: true,
      pause: false,
      success: false
    };
    this.startTimer = this.startTimer.bind(this);
    this.pauseTimer = this.pauseTimer.bind(this);
    this.clickRestart = this.clickRestart.bind(this);
    this.clickStart = this.clickStart.bind(this);
    this.clickPause = this.clickPause.bind(this);
    this.onSwiped = this.onSwiped.bind(this);
    this.onSwiping = this.onSwiping.bind(this);
  }

  componentDidUpdate() {
    if (!this.state.success && checkWin(this.props.squares)) {
      this.setState({ success: true });
      this.pauseTimer();
    }
  }

  componentWillMount() {
    if (checkWin(this.props.squares)) {
      // 防治随机产生的顺序已是正解，打乱一次
      this.props.resetBoard();
    }
  }

  clickStart(e) {
    // 开始计数
    this.startTimer();
    this.setState({
      start: false,
      pause: false,
      success: false
    });
  }

  clickPause(e) {
    this.setState({
      pause: true
    });
    // 暂停计数
    this.pauseTimer();
  }

  clickRestart(e) {
    this.props.resetBoard();
    this.pauseTimer();
    this.setState({
      start: true,
      pause: false,
      success: false,
      timer: 0
    });
  }

  startTimer() {
    if (!this.timerInterval) {
      this.timerInterval = setInterval(() => {
        this.setState(prevState => ({
          timer: ++prevState.timer
        }));
      }, 1000);
    }

    !this.state.start
      ? this.setState(prevState => ({
          timer: ++prevState.timer
        }))
      : this.setState({
          start: false
        });
  }

  pauseTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = 0;
    }
  }

  onSwiping(e, deltaX, deltaY, absX, absY, velocity) {
    var move = { x: 0, y: 0 };
    if (absY >= 30) {
      move.y = deltaY > 0 ? -1 : 1;
    }
    if (absX >= 30) {
      move.x = deltaX > 0 ? -1 : 1;
    }
    console.log("You Swiping...", move, e.target.id, e, {
      deltaX,
      deltaY,
      absX,
      absY,
      velocity
    });
    const emptyId = this.props.squares.empty;
    if ((move.x || move.y) && canMove(e.target.id, move, emptyId)) {
      this.props.moveSquare(e.target.id, emptyId);
    }
    // e.preventDefault();
    // 判断默认行为是否可以被禁用[新版chrome取消preventDefault]
    if (event.cancelable) {
      // 判断默认行为是否已经被禁用
      if (!event.defaultPrevented) {
        event.preventDefault();
      }
    }
    e.stopPropagation();
  }

  render() {
    const { current, squares } = this.props;
    var width = (window.document.body.clientWidth - 48) / 4,
      time = formatTime(this.state.timer);
    width > 150 && (width = 150);
    return (
      <div
        className="board"
        style={{
          padding: "20px"
        }}
      >
        <div ref="tips" className="board-title">
          <span style={countStyle}>{current.count || 0}</span>
          <span style={tipsStyle}>{" 步／时间 "}</span>
          <span style={timeStyle}>{time}</span>
          <div className="btns-title">
            <i className="icon-pause" onClick={this.clickPause} />
          </div>
        </div>
        <div className="chess-square">
          {squares.map((item, i) => (
            <Swipeable
              key={item.num}
              onSwiped={this.onSwiped}
              onSwiping={this.onSwiping}
              onSwipingLeft={this.swipingLeft}
              onSwipedUp={this.swipedRight}
              className="pieces"
              style={{
                width: width + "px",
                height: width + "px",
                lineHeight: width + "px"
              }}
            >
              <Square index={i} num={item.num} position={item.position} />
            </Swipeable>
          ))}
        </div>
        {this.state.start ? (
          <div className="mask">
            <div className="btn-start" onClick={this.clickStart}>
              开始
            </div>
          </div>
        ) : (this.state.pause ? (
          <div className="mask">
            <div className="btns-mask">
              <i className="icon-start" onClick={this.clickStart} />
              <i className="icon-redo" onClick={this.clickRestart} />
            </div>
          </div>
        ) : (this.state.success && (
          <div className="mask">
            <span
              style={{
                position: "relative",
                top: "30%",
                fontSize: '30px'
              }}
            >
              恭喜你完成啦~
            </span>
            <div className="btn-start" onClick={this.clickRestart}>
              再玩一局
            </div>
          </div>
        )))}
      </div>
    );
  }
}

Board.propTypes = {
  //
};

const mapStateToProps = state => {
  console.log("mapProps:", state); //////
  return {
    squares: state.squares,
    current: state.current
  };
};
const mapDispatchToProps = dispatch => {
  return {
    resetBoard: lvl => {
      dispatch(resetBoard(lvl));
    },
    moveSquare: (from, to) => {
      // 判断是否可移动
      dispatch(moveSquare(from, to));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Board);
