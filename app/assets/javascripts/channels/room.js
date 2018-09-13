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

    let verticalDegree = data["data"]["gyro"]["do"]["beta"]
    if (verticalDegree > 25) {
      verticalDegree = 25
    } else if (verticalDegree < -25) {
      verticalDegree = -25
    }

    verticalDegree += 25
    pointer.style.bottom = (verticalDegree / 50) * 100 + "vh"

    let horizontalDegree = data["data"]["gyro"]["do"]["alpha"]
    if (horizontalDegree > 35 && horizontalDegree < 70) {
      horizontalDegree = 35
    } else if (horizontalDegree < 325 && horizontalDegree > 70) {
      horizontalDegree = 325
    }

    horizontalDegree = (horizontalDegree + 35) % 360
    pointer.style.right = (horizontalDegree / 70) * 100 + "vw"

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
