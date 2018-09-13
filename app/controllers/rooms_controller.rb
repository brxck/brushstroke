class RoomsController < ApplicationController
  before_action :sort_browsers, only: :create

  def create
    @room = Room.create
    redirect_to helpers.code_path(@room.code)
  end

  def show
    @room = Room.find_by(code: params[:code])
    session[:code] = @room.code

    render :paint if browser.device.mobile? || browser.device.tablet?
  end

  def edit
  end

  def find
  end

  def search
    @room = Room.find_by(code: params[:code])
    if @room
      redirect_to helpers.code_path(@room.code)
    else
      flash.now[:danger] = "Room not found"
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