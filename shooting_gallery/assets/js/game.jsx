import React from "react";
import ReactDOM from "react-dom";
import Konva from "konva";
import { Stage, Layer, Circle, Rect, Text, Group } from "react-konva";
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
      s1: 0,
      s2: 0,
      p1: null,
      p2: null,
      p: this.props.name,
      player: 0,
      timer: "60",
      targets: [],
      offset: 0,
      offsetDirection: "right",
    };
    this.channel
      .join()
      .receive("ok", resp => {
        console.log("Joined successfully", resp);
        const g = resp.game;
        this.setState(g);
        if (g.p1 === this.props.name) {
          this.setState({ player: 1 });
        }
        if (g.p2 === this.props.name) {
          this.setState({ player: 2 });
        }
        this.setState({ p: this.props.name });
      })
      .receive("error", resp => {
        console.log("Unable to join", resp);
      });
    this.channel.on("update", resp => {
      const g = resp.game;
      this.setState(g);
      // console.log(this.state);
    });

    this.intervalHandle;
    this.offsetHandle;
  }

  // Move the cursor when the player moves their mouse
  moveCursor(e) {
    let x = e.evt.layerX,
      y = e.evt.layerY;
    this.channel
      .push("moveCursor", { x: x, y: y, player: this.state.player })
      .receive("ok", resp => {
        this.setState(resp.game);
      });
  }

  // Shoot the given target when it is clicked
  shootTarget(id) {
    this.channel
      .push("shootTarget", { player: this.state.player, id: id })
      .receive("ok", resp => {
        this.setState(resp.game);
      });
  }

  confirmGame() {
    this.channel.push("confirm", { player: this.state.player }).receive("ok"),
      resp => {
        this.setState(resp.game);
      };
  }

  tick() {
    let time = parseInt(this.state.timer);
    this.setState({
      timer: "" + time - 1
    });
    let random = Math.random();
    if (random > 0.7) {
      this.channel.push("addTarget", {}).receive("ok"),
        resp => {
          this.setState(resp.game);
        };
    }
  }

  calculateOffset() {
    if(this.state.offsetDirection == "right") {
        this.setState({offset: this.state.offset + 2});
      }
      if(this.state.offsetDirection == "left") {
        this.setState({offset: this.state.offset - 2});
      }
      if (this.state.offset >= 200) {
          this.setState({offsetDirection: "left"});
      }
      if (this.state.offset <= -200 ){
        this.setState({offsetDirection: "right"});
    }
      
  }

  render() {
    let timerButton;
    if (this.state.p1Confirmed && this.state.p2Confirmed) {
      if (!this.state.gameStarted) {
        this.intervalHandle = setInterval(this.tick.bind(this), 1000);
        this.offsetHandle = setInterval(this.calculateOffset.bind(this), 0);
        this.setState({ gameStarted: true });
      }
      timerButton = (
        <Text
          text={"Time remaining: " + this.state.timer}
          x={20}
          y={22.5}
          fontSize={20}
        />
      );
    } else {
      timerButton = (
        <Group onClick={this.confirmGame.bind(this)}>
          <Rect x={10} y={10} width={120} height={40} fill="#ddd" />
          <Text text="Start Game" x={20} y={25} fontSize={20} />
        </Group>
      );
    }
    return (
      <Stage width={900} height={400} onMouseMove={this.moveCursor.bind(this)}>
        <Layer>
          <Text text={"Score"} x={600} y={5} fontSize={20} />
          <Text
            text={
              this.state.p1 +
              ": " +
              this.state.s1 * 10 +
              "  " +
              this.state.p2 +
              ": " +
              this.state.s2 * 10
            }
            x={600}
            y={25}
            fontSize={20}
          />
          <Circle x={this.state.x1} y={this.state.y1} radius={10} fill="#000" />
          <Circle x={this.state.x2} y={this.state.y2} radius={10} fill="#ddd" />
          {timerButton}
          <Targets root={this} state={this.state}/>
        </Layer>
      </Stage>
    );
  }
}

function Targets(props) {
  let root = props.root,
    targets = root.state.targets,
    renderedTargets = _.map(targets, target => {
      return (
        <Group onClick={() => root.shootTarget(target.id)}>
        <Circle
          key={target.id}
          x={target.type == 3 ? target.x + props.state.offset : target.x}
          y={target.type == 2 ? target.y + props.state.offset : target.y}
          radius={20}
          fill="#f00"
        />
        <Circle
          key={target.id + 1}
          x={target.type == 3 ? target.x + props.state.offset : target.x}
          y={target.type == 2 ? target.y + props.state.offset : target.y}
          radius={12}
          fill="#fff"
        />
        <Circle
          key={target.id + 2}
          x={target.type == 3 ? target.x + props.state.offset : target.x}
          y={target.type == 2 ? target.y + props.state.offset : target.y}
          radius={5}
          fill="#f00"
        />
        </Group>
      );
    });
  return renderedTargets;
}
