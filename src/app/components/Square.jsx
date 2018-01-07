import React from "react";

export default class Square extends React.PureComponent {
  render() {
    // position: {x, y}
    const { num, index, position } = this.props;
    return (
      <div
        title={num}
        id={index}
        className={"chessman" + (num == 0 ? ' hide' : '')}
      >
        {num}
      </div>
    );
  }
}
