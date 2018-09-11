class CanvasesController < ApplicationController
  def create
    @canvas = Canvas.create
    redirect_to "/c/#{@canvas.code}"
  end

  def show
    @canvas = Canvas.find_by(code: params[:code])
  end

  def find
  end

  def search
    @canvas = Canvas.find_by(code: params[:code])
    if @canvas
      render :show
    else
      flash.now[:danger] = "canvas not found"
      render :find
    end
  end
end
