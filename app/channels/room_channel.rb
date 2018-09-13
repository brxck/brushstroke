class RoomChannel < ApplicationCable::Channel
  def subscribed
    stream_for @room
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def update(data)
    RoomChannel.broadcast_to(@room, data: data)
  end
end
