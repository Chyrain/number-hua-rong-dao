import React from "react";

export default class Square extends React.PureComponent {
  componentWillMount() {
    console.log("componentWillMount", this.props);
  }

  componentWillUnmount() {
    console.log("componentWillUnmount", this.props);
  }

  componentWillUpdate() {
    console.log("componentWillUpdate", this.props);
  }

  componentDidUpdate() {
    console.log("componentDidUpdate", this.props && this.props.num, this.props);
  }

  render() {
    // position: {x, y}
    const { num, index, position } = this.props;
    return (
      <div
        title={num}
        id={index}
        className={"chessman" + (num == index + 1 ? " active" : "")}
      >
        {num}
      </div>
    );
  }
}
