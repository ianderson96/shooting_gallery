defmodule ShootingGallery.Game do
  def new do
    %{
      p1: "",
      x1: 0,
      y1: 0,
      s1: 0,
      p1Confirmed: false,
      p2: "",
      x2: 0,
      y2: 0,
      s2: 0,
      p2Confirmed: false,
      targets: [],
      gameEnded: false
    }
  end

  def client_view(game) do
    %{
      p1: game.p1,
      x1: game.x1,
      y1: game.y1,
      s1: game.s1,
      p1Confirmed: game.p1Confirmed,
      p2: game.p2,
      x2: game.x2,
      y2: game.y2,
      s2: game.s2,
      p2Confirmed: game.p2Confirmed,
      targets: game.targets,
      gameEnded: game.gameEnded
    }
  end

  def move(game, x, y, player) do
    if player == 1 do
      Map.merge(game, %{x1: x, y1: y})
    else
      Map.merge(game, %{x2: x, y2: y})
    end
  end

  def confirmPlayer(game, player) do
    if player == 1 do
      game
        |> Map.merge(%{p1Confirmed: true})
    else
      game
        |> Map.merge(%{p2Confirmed: true})
    end
  end

  def getScoreAdd(type) do
    if type == 8 do
        30
    else
        10
    end
  end

  def shootTarget(game, player, id) do
    targets = Enum.reject(game.targets, fn x -> x.id == id end)
    target = hd(Enum.filter(game.targets, fn x -> x.id == id end))
    scoreAdd = getScoreAdd(target.type)
    if player == 1 do
      game
        |> Map.merge( %{s1: game.s1 + scoreAdd, targets: targets})
    else
      game
        |> Map.merge(%{s2: game.s2 + scoreAdd, targets: targets})
    end
  end

  def addTarget(game) do
    targets = game.targets

    newTargets =
      targets ++ [%{x: :rand.uniform(850), 
      y: :rand.uniform(400)+ 70, 
      id: :rand.uniform(100_000), 
      type: :rand.uniform(9)}]

    game
    |> Map.put(:targets, newTargets)
  end

  def selectPlayer(game, playerName) do
    if game.p1 == "" || game.p1 == playerName do
      Map.put(game, :p1, playerName)
    else
      Map.put(game, :p2, playerName)
    end
  end

  def startGame(game) do
    game
      |> Map.merge(%{s1: 0, s2: 0, targets: [], gameEnded: false})
  end

  def endGame(game) do
    game
      |> Map.merge(%{p1Confirmed: false, p2Confirmed: false, targets: [], gameEnded: true})
  end
end
