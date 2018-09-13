class PaintChannel < ApplicationCable::Channel
  def subscribed
    stream_from "paint_channel_#{session[:code]}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def update(data)
  end
end
