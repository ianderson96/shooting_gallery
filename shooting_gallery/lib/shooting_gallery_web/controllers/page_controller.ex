defmodule ShootingGalleryWeb.PageController do
  use ShootingGalleryWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
