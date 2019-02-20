defmodule ShootingGallery.GameServer do
  use GenServer

  def reg(name) do
    {:via, Registry, {ShootingGallery.GameReg, name}}
  end

  def start(name) do
    spec = %{
      id: __MODULE__,
      start: {__MODULE__, :start_link, [name]},
      restart: :permanent,
      type: :worker
    }

    ShootingGallery.GameSup.start_child(spec)
  end

  def start_link(name) do
    game = ShootingGallery.BackupAgent.get(name) || ShootingGallery.Game.new()
    GenServer.start_link(__MODULE__, game, name: reg(name))
  end

  def init(game) do
    {:ok, game}
  end
end
