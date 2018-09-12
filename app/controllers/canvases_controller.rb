class CanvasesController < ApplicationController
  before_action :sort_browsers, only: :create

  def create
    @canvas = Canvas.create
    redirect_to helpers.code_path(@canvas.code)
  end

  def show
    @canvas = Canvas.find_by(code: params[:code])
    session[:code] = @canvas.code

    render :paint if browser.device.mobile? || browser.device.tablet?
  end

  def edit
  end

  def find
  end

  def search
    @canvas = Canvas.find_by(code: params[:code])
    if @canvas
      redirect_to helpers.code_path(@canvas.code)
    else
      flash.now[:danger] = "canvas not found"
      render :find
    end
  end

  private

  def sort_browsers
    if session[:code]
      redirect_to helpers.code_path(session[:code])
    elsif browser.device.mobile? || browser.device.tablet?
      render :find
    end
  end
end
