const gyro = new GyroNorm()

App.room = App.cable.subscriptions.create("RoomChannel", {
  connected: function () {
    // Called when the subscription is ready for use on the server
    gyro.init().then(() => {
      gyro.start(data => {
        this.perform("update", { gyro: "hello" })
      })
    })
  },

  disconnected: function () {
    // Called when the subscription has been terminated by the server
  },

  received: function (data) {
    // Called when there's incoming data on the websocket for this channel
    const dataFrame = document.getElementById("data-frame")
    dataFrame.innerHTML = JSON.stringify(data)
  }
})
