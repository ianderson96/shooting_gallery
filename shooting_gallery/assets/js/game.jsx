import React from "react";
import ReactDOM from "react-dom";
import Konva from "konva";
import { Stage, Layer, Circle } from "react-konva";
import _ from "lodash";

export default function game_init(root, channel, playerName) {
  ReactDOM.render(<Game channel={channel} name={playerName} />, root);
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.channel = props.channel;
    this.state = {
      x1: 0,
      y2: 0,
      x2: 0,
      y2: 0,
      p1: null,
      p2: null,
      p: this.props.name,
      player: 0,
    };
    this.channel
      .join()
      .receive("ok", resp => {
        console.log("Joined successfully", resp);
        const g = resp.game;
        this.setState(g);
        if (g.p1 === this.props.name) {
          this.setState({player: 1});
        }
        if (g.p2 === this.props.name) {
          this.setState({player: 2});
        }
        this.setState({p: this.props.name});
      })
      .receive("error", resp => {
        console.log("Unable to join", resp);
      });
    this.channel.on("update", resp => {
      const g = resp.game;
        this.setState(g);
        // console.log(this.state);
    });
  }

  // Move the cursor when the player moves their mouse
  moveCursor(e) {
    let x = e.evt.layerX,
        y = e.evt.layerY;
    this.channel.push("moveCursor", { x: x, y: y, player: this.state.player }).receive("ok", resp => {
      console.log(resp.game);
      this.setState(resp.game);
      console.log(this.state);
    })
  }


  render() {
    return (
      <Stage width={1000} height={1000} onMouseMove={this.moveCursor.bind(this)}>
        <Layer>
          <Circle
            x={this.state.x1}
            y={this.state.y1}
            radius={10}
            fill="#000"
          />
          <Circle
            x={this.state.x2}
            y={this.state.y2}
            radius={10}
            fill="#ddd"
          />
        </Layer>
      </Stage>
    );
  }
}
