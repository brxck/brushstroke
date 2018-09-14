// Only run on room pages
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("room") !== null) {
    subscribeRoom()
  }
})

function subscribeRoom () {
  let pointer
  let canvas
  let context

  App.room = App.cable.subscriptions.create("RoomChannel", {
    connected: function () {
      pointer = document.getElementById("pointer")
      canvas = document.getElementById("canvas")
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      context = canvas.getContext("2d")
      context.moveTo(canvas.width / 2, canvas.height / 2)
    },

    received: function (data) {
      // Update pointer location and appearance
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

      // Draw on canvas
      if (data["data"]["draw"] === true) {
        context.lineTo(pointer.offsetLeft, pointer.offsetTop)
        context.stroke()
      } else {
        context.moveTo(pointer.offsetLeft, pointer.offsetTop)
      }
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
