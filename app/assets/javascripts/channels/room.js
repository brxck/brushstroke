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
      context.lineWidth = 10
      context.lineCap = "round"
      context.lineJoin = "round"
    },

    received: function (data) {
      // Update pointer location and appearance
      pointer.style.bottom =
        angleToPosition(data["data"]["gyro"]["do"]["beta"], 25, 75, 50) + "vh"

      pointer.style.right =
        angleToPosition(data["data"]["gyro"]["do"]["alpha"], 45, 135, 90) + "vw"

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

      printDebug(data)
    }
  })
}

function angleToPosition (degree, min, max, offset) {
  degree += offset
  degree %= 360

  if (degree > max) {
    degree = max
  } else if (degree < min) {
    degree = min
  }

  return ((degree - min) / (max - min)) * 100
}

function printDebug (data) {
  const view = document.getElementById("debug")
  data = data["data"]["gyro"]["do"]
  view.innerHTML = `
    alpha: ${data["alpha"]}<br>
    beta: ${data["beta"]}<br>
    gamma: ${data["gamma"]}<br>
  `
}
