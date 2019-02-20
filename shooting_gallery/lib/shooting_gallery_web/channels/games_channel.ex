defmodule ShootingGalleryWeb.GamesChannel do
  use ShootingGalleryWeb, :channel

  alias ShootingGallery.Game
  alias ShootingGallery.BackupAgent

  def join("games:" <> name, payload, socket) do
    if authorized?(payload) do
      game = BackupAgent.get(name) || Game.new()
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

  # def handle_in("moveCursor", %{"x" => x, "y" => y, "player" => p}, socket) do
  #   name = socket.assigns[:name]
  #   game = Game.move(socket.assigns[:game], x, y, p)
  #   socket = assign(socket, :game, game)
  #   BackupAgent.put(name, game)
  #   {:reply, {:ok, %{"game" => Game.client_view(game)}}, socket}
  # end

  # def handle_in("update", _payload, socket) do
  #   name = socket.assigns[:name]
  #   game = socket.assigns[:game]
  #   socket = assign(socket, :game, game)
  #   {:reply, {:ok, %{"game" => Game.client_view(game)}}, socket}
  # end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
