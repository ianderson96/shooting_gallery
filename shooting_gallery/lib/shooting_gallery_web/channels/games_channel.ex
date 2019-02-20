defmodule ShootingGalleryWeb.GamesChannel do
  use ShootingGalleryWeb, :channel

  alias ShootingGallery.Game
  alias ShootingGallery.BackupAgent

  intercept ["update"]

  def join("games:" <> name, payload, socket) do
    if authorized?(payload) do
      game = BackupAgent.get(name) || Game.new()
      game = Game.selectPlayer(game, payload["playerName"])
      IO.inspect(game)
      BackupAgent.put(name, game)

      socket =
        socket
        |> assign(:game, game)
        |> assign(:name, name)

      {:ok, %{"join" => name, "game" => Game.client_view(game)}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_in("moveCursor", %{"x" => x, "y" => y, "player" => player}, socket) do
    name = socket.assigns[:name]
    game = BackupAgent.get(name)
    game = Game.move(game, x, y, player)
    socket = assign(socket, :game, game)
    BackupAgent.put(name, game)
    push_update!(game, socket)
    {:reply, {:ok, %{"game" => Game.client_view(game)}}, socket}
  end

  def handle_in("confirm", %{"player" => player}, socket) do
    name = socket.assigns[:name]
    game = BackupAgent.get(name)
    game = Game.confirmPlayer(game, player)
    socket = assign(socket, :game, game)
    BackupAgent.put(name, game)
    push_update!(game, socket)
    {:reply, {:ok, %{"game" => Game.client_view(game)}}, socket}
  end

  def handle_out("update", game_data, socket) do
    push(socket, "update", %{"game" => game_data})
    {:noreply, socket}
  end

  defp push_update!(view, socket) do
    broadcast!(socket, "update", view)
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
