class CanvasesController < ApplicationController
  def create
    @canvas = Canvas.create()
    redirect_to @canvas
  end

  def show

  end

  def destroy

  end
end
