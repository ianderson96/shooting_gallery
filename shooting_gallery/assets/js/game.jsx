import React from "react";
import ReactDOM from "react-dom";
import Konva from "konva";
import { Stage, Layer, Circle } from "react-konva";
import _ from "lodash";

export default function game_init(root, channel) {
  ReactDOM.render(<Game channel={channel} />, root);
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.channel = props.channel;
    this.state = {
      x: 0,
      y: 0,
      player: "demo"
    };
    this.channel
      .join()
      .receive("ok", resp => {
        console.log("Joined successfully", resp);
        const g = resp.game;
        this.setState(g);
      })
      .receive("error", resp => {
        console.log("Unable to join", resp);
      });
  }

  moveCursor(e) {
    this.setState({ x: e.screenX, y: e.screenY });
  }


  render() {
    return (
      <Stage width="500" height="500" onMouseMove={this.moveCursor.bind(this)}>
        <Layer>
          <Circle
            x={this.state.x}
            y={this.state.y}
            fill="#000000"
          />
        </Layer>
      </Stage>
    );
  }
}
