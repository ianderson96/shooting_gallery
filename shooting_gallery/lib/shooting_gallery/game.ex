defmodule Memory.Game do
  def new do
    %{
      players: init_players()
    }
  end

  def client_view(game) do
    ts = game.tiles
    s = game.score

    %{
      "tiles" => ts,
      "score" => s
    }
  end

  def init_players() do
    player1 = %{x: 0, y: 0, score: 0}
    player2 = %{x: 0, y: 0, score: 0}
    %{player1: player1, player2: player2}
  end
end
