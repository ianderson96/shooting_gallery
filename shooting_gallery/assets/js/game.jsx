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
      x1: 0, // x-coordinate of Player 1
      y2: 0, // y-coordinate of Player 1
      x2: 0, // x-coordinate of Player 2
      y2: 0, // y-coordinate of Player 2
      s1: 0, // Player 1's score
      s2: 0, // Player 2's score
      p1: null, // Player 1's name
      p1Confirmed: false, // is Player 1 ready to play?
      p2: null, // Player 2's name
      p2Confirmed: false, // is Player 2 ready to play?
      p: this.props.name, // current player's name
      player: 0, // current player's number
      timer: "60",
      targets: [],
      offset: 0, 
      offsetDirection: "right",
      gameStarted: false,
      gameEnded: false
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

  // Tell the game that the given player is ready to play
  confirmGame() {
    this.channel.push("confirm", { player: this.state.player })
    .receive("ok", resp => {
        this.setState(resp.game);
        if (this.state.p1Confirmed && this.state.p2Confirmed) {
          this.startGame();
        }
      });
  }

  // Update the game every tick
  tick() {
    let time = parseInt(this.state.timer);
    this.setState({
      timer: "" + time - 1
    });
    if (this.state.timer <= 0) {
      this.endGame();
    }
    else {
      let random = Math.random();
      if (random > 0.7) {
        this.channel.push("addTarget", {})
        .receive("ok",
          resp => {
            this.setState(resp.game);
          });
      }
    }
    
  }

  // Start the game when both players are ready
  startGame() {
    this.channel.push("startGame", {})
    .receive("ok",
      resp => {
        this.setState(resp.game);
      });
  }

  // End the game when the timer runs out
  endGame() {
    this.channel.push("endGame", {})
    .receive("ok",
      resp => {
        this.setState(resp.game);
        this.setState({ timer: "60", gameStarted: false });
        clearInterval(this.intervalHandle);
      });
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
    if (!this.state.gameEnded && this.state.p1Confirmed && this.state.p2Confirmed) {
      if (!this.state.gameStarted) {
        this.intervalHandle = setInterval(this.tick.bind(this), 1000);
        this.offsetHandle = setInterval(this.calculateOffset.bind(this), 0);
        this.setState({ gameStarted: true });
      }
      timerButton = (
        <Group>
          <Text
            text={"Time remaining: " + this.state.timer}
            x={20}
            y={22.5}
            fontSize={20}
          />
          <Text text={"Score"} x={600} y={5} fontSize={20} />
          <Score root={this}/>
        </Group>
      );
    } else {
      if (this.state.gameEnded) {
        timerButton = (
          <Group>
            <Text text={"Score"} x={600} y={5} fontSize={20} />
            <Score root={this}/>
            <Outcome root={this} />
            <Group onClick={this.confirmGame.bind(this)}>
              <Rect x={10} y={10} width={150} height={40} fill="#ddd" />
              <Text text="Restart Game" x={20} y={25} fontSize={20} />
            </Group>
          </Group>
        )
      } else {
        timerButton = (
          <Group onClick={this.confirmGame.bind(this)}>
            <Rect x={10} y={10} width={120} height={40} fill="#ddd" />
            <Text text="Start Game" x={20} y={25} fontSize={20} />
          </Group>
        );
      }
    }
    return (
      <Stage width={900} height={400} onMouseMove={this.moveCursor.bind(this)}>
        <Layer>
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

function Score(props) {
  let root = props.root,
      state = root.state,
      score = state.p1 + ": " + state.s1 + "\n" + state.p2 + ": " + state.s2;
  return (
    <Text text={score} x={600} y={25} fontSize={20} />
  )
}

function Outcome(props) {
  let root = props.root,
      state = root.state,
      result = "";
  if (state.s1 > state.s2) {
    result = state.p1 + " wins!";
  }
  if (state.s2 > state.s1) {
    result = state.p2 + " wins!";
  }
  if (state.s1 === state.s2) {
    result = "Tie!";
  }
  return (
    <Text text={result} x={300} y={150} fontSize={40} />
  )
}
