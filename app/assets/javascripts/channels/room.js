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
  let tuneCount = 0
  let connection = false

  let xmin = 45
  let xmax = 135
  let ymin = 25
  let ymax = 75

  const points = []
  App.room = App.cable.subscriptions.create("RoomChannel", {
    connected: function () {
      readyCanvases()
      showMessage(
        `Your code is: <strong>${
          document.getElementById("room").dataset.code
        }</strong>
        <br>Point your phone at the center of the screen and connect it.`
      )
    },

    received: function (data) {
      data = data["data"]
      updatePointer(data)

      // Begin calibrating
      if (data["draw"]["action"] === "tune") {
        showMessage("Tilt your phone toward each target and tap the draw area.")
        setTargetDisplay(0, true)
        setPointerDisplay(false)
        tuneCount = 4
        // Calibrate targets
      } else if (tuneCount > 0 && data["draw"]["release"] === true) {
        let calibrated = tune(data, tuneCount)
        if (calibrated === true) {
          tuneCount -= 1
        }
        // Clean up after calibrating
        if (tuneCount === 0) {
          hideMessage()
          setPointerDisplay(true)
        }
      } else if (data["draw"]["action"] === "save") {
        save()
      } else if (data["draw"]["action"] === "clear") {
        tempContext.clearRect(0, 0, temp.width, temp.height)
        context.clearRect(0, 0, canvas.width, canvas.height)
      } else {
        draw(data)
      }

      // Hide prompt after connection
      if (connection === false) {
        connection = true
        hideMessage()
      }

      // printDebug(data)
    }
  })

  function readyCanvases () {
    // One temporary canvas for drawing the current line
    // The other canvas for holding all the final work
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
      angleToPosition(data["gyro"]["do"]["beta"], ymin, ymax, 50) + "vh"
    pointer.style.right =
      angleToPosition(data["gyro"]["do"]["alpha"], xmin, xmax, 90) + "vw"
    pointer.style.transform = "rotate(" + data["gyro"]["do"]["gamma"] + "deg)"
    pointer.style["background-color"] = data["draw"]["color"]
    pointer.style.width = data["draw"]["size"] + "px"
    pointer.style.height = data["draw"]["size"] + "px"
  }

  function setPointerDisplay (boolean) {
    pointer.style.opacity = boolean ? 100 : 0
  }

  function angleToPosition (degree, min, max, offset) {
    // Shift values so we're dealing with a continuous range
    // Plus an additional arbitrary amount to avoid wrapping the alpha angles
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
    tempContext.fillStyle = data["draw"]["color"]
    // Draw smooth lines using quadratic curves, mishmash of these two sources:
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
    } else {
      // Redraw with only one stroke before committing to canvas
      tempContext.clearRect(0, 0, temp.width, temp.height)
      if (data["draw"]["fill"] === true) {
        tempContext.closePath()
        tempContext.fill()
      }
      tempContext.stroke()

      // Commit to canvas
      context.drawImage(temp, 0, 0)

      tempContext.beginPath() // Important to clear path so we don't keep stroking it
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

  function setTargetDisplay (number, visibility) {
    let targets = document.getElementsByClassName("target")
    targets.item(number).style.opacity = visibility ? 100 : 0
  }

  function tune (data, count) {
    if (data["draw"]["drawing"] === true) {
      switch (count) {
        case 4:
          xmax = (data["gyro"]["do"]["alpha"] + 90) % 360
          setTargetDisplay(0, false)
          setTargetDisplay(1, true)
          return true
        case 3:
          ymax = (data["gyro"]["do"]["beta"] + 50) % 360
          setTargetDisplay(1, false)
          setTargetDisplay(2, true)
          return true
        case 2:
          xmin = (data["gyro"]["do"]["alpha"] + 90) % 360
          setTargetDisplay(2, false)
          setTargetDisplay(3, true)
          return true
        case 1:
          ymin = (data["gyro"]["do"]["beta"] + 50) % 360
          setTargetDisplay(3, false)
          return true
        default:
          return false
      }
    }
  }

  function showMessage (message) {
    document.getElementById("message-content").innerHTML = message
    document.getElementById("message").style.opacity = 100
  }

  function hideMessage () {
    document.getElementById("message").style.opacity = 0
  }

  function printDebug (data) {
    const view = document.getElementById("debug")
    view.innerHTML = "Orientation:<br>"
    view.innerHTML += formatDebug(data["gyro"]["do"])
    view.innerHTML += "<br>Draw:<br>"
    view.innerHTML += formatDebug(data["draw"])
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
