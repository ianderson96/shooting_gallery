defmodule ShootingGalleryWeb.PageController do
  use ShootingGalleryWeb, :controller

  def game(conn, %{"name" => name}) do
    render conn, "game.html", name: name
  end

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
