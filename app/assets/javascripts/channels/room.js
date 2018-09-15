// Only run on room pages
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("room") !== null) {
    subscribeRoom()
  }
})

function subscribeRoom () {
  const pointer = document.getElementById("pointer")
  const canvas = document.getElementById("canvas")
  const context = canvas.getContext("2d")
  const temp = document.getElementById("temp")
  const tempContext = temp.getContext("2d")

  const points = []
  App.room = App.cable.subscriptions.create("RoomChannel", {
    connected: function () {
      readyCanvases()
    },

    received: function (data) {
      data = data["data"]
      updatePointer(data)
      draw(data)
      if (data["actions"]["save"] === true) {
        save()
      }
      printDebug(data)
    }
  })

  function readyCanvases () {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    temp.width = window.innerWidth
    temp.height = window.innerHeight

    tempContext.moveTo(canvas.width / 2, canvas.height / 2)
    tempContext.lineWidth = 10
    tempContext.lineCap = "round"
    tempContext.lineJoin = "round"
  }

  function updatePointer (data) {
    pointer.style.bottom =
      angleToPosition(data["gyro"]["do"]["beta"], 25, 75, 50) + "vh"

    pointer.style.right =
      angleToPosition(data["gyro"]["do"]["alpha"], 45, 135, 90) + "vw"

    pointer.style.transform = "rotate(" + data["gyro"]["do"]["gamma"] + "deg)"

    let acceleration = Math.max(
      data["gyro"]["dm"]["beta"],
      data["gyro"]["dm"]["alpha"]
    )
    acceleration = Math.abs(acceleration)
    acceleration = (acceleration / 100) * 255
    pointer.style["background-color"] = "hsl(" + acceleration + ", 100%, 50%)"
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

  function draw (data) {
    tempContext.strokeStyle = data["draw"]["color"]
    // Draw smooth lines using bezier curves, mishmash of these two sources:
    // perfectionkills.com/exploring-canvas-drawing-techniques/#bezier-curves
    // codetheory.in/html5-canvas-drawing-lines-with-smooth-edges/

    if (data["draw"]["drawing"] === true || data["draw"]["lock"]) {
      points.push({ x: pointer.offsetLeft, y: pointer.offsetTop })

      let p1 = points[0]
      let p2 = points[1]

      tempContext.clearRect(0, 0, tempContext.width, tempContext.height)
      tempContext.beginPath()
      tempContext.moveTo(p1.x, p1.y)

      for (let i = 1; i < points.length; i++) {
        let midpoint = calcMidpoint(p1, p2)
        tempContext.quadraticCurveTo(p1.x, p1.y, midpoint.x, midpoint.y)
        p1 = points[i]
        p2 = points[i + 1]
      }

      tempContext.lineWidth = data["draw"]["size"]
      tempContext.stroke()
    } else if (data["actions"]["clear"] === true) {
      tempContext.clearRect(0, 0, temp.width, temp.height)
      context.clearRect(0, 0, canvas.width, canvas.height)
    } else {
      // Redraw with only one stroke before committing to canvas
      tempContext.clearRect(0, 0, temp.width, temp.height)
      tempContext.stroke()
      // Important to clear path so we don't keep stroking it
      tempContext.beginPath()

      // Commit to canvas
      context.drawImage(temp, 0, 0)

      tempContext.clearRect(0, 0, temp.width, temp.height)
      points.length = 0
      context.moveTo(pointer.offsetLeft, pointer.offsetTop)
    }
  }

  function calcMidpoint (start, end) {
    return {
      x: start.x + (end.x - start.x) / 2,
      y: start.y + (end.y - start.y) / 2
    }
  }

  function save () {
    window.open(canvas.toDataURL())
  }

  function printDebug (data) {
    const view = document.getElementById("debug")
    view.innerHTML = "Orientation:<br>"
    view.innerHTML += formatDebug(data["gyro"]["do"])
    view.innerHTML += "<br>Draw:<br>"
    view.innerHTML += formatDebug(data["draw"])
    view.innerHTML += "<br>Actions:<br>"
    view.innerHTML += formatDebug(data["actions"])
  }

  function formatDebug (data) {
    let string = ""
    let key, value
    for ([key, value] of Object.entries(data)) {
      string += `${key}: ${value}<br>`
    }
    return string
  }
}
