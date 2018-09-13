const gyro = new GyroNorm()

let dataFrame
let pointer

App.room = App.cable.subscriptions.create("RoomChannel", {
  connected: function () {
    // Called when the subscription is ready for use on the server
    dataFrame = document.getElementById("data-frame")
    pointer = document.getElementById("pointer")

    gyro.init().then(() => {
      gyro.start(data => {
        this.perform("update", { gyro: data })
      })
    })
  },

  disconnected: function () {
    // Called when the subscription has been terminated by the server
  },

  received: function (data) {
    // Called when there's incoming data on the websocket for this channel
    dataFrame.innerHTML = JSON.stringify(data)

    pointer.style.bottom =
      angleToPosition(data["data"]["gyro"]["do"]["beta"], 50) + "vh"

    pointer.style.right =
      angleToPosition(data["data"]["gyro"]["do"]["alpha"], 70) + "vw"

    pointer.style.transform =
      "rotate(" + data["data"]["gyro"]["do"]["gamma"] + "deg)"

    let acceleration = Math.max(
      data["data"]["gyro"]["dm"]["beta"],
      data["data"]["gyro"]["dm"]["alpha"]
    )
    acceleration = Math.abs(acceleration)
    acceleration = (acceleration / 100) * 255
    pointer.style["background-color"] = "hsl(" + acceleration + ", 100%, 50%)"
  }
})

function angleToPosition (degree, range) {
  degree += range / 2
  degree %= 360

  if (degree > range) {
    degree = range
  } else if (degree < 0) {
    degree = 0
  }

  return (degree / range) * 100
}
