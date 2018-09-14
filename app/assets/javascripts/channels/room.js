// Only run on room pages
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("room") !== null) {
    subscribeRoom()
  }
})

function subscribeRoom () {
  let pointer

  App.room = App.cable.subscriptions.create("RoomChannel", {
    connected: function () {
      pointer = document.getElementById("pointer")
    },

    received: function (data) {
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
}

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
