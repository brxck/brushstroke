// Only run on remote pages
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("remote") !== null) {
    subscribeRemote()
  }
})

function subscribeRemote () {
  let draw = false
  let lock = false
  let size = document.getElementById("size").value
  let color = "black"
  let clear = false
  let save = false

  App.room = App.cable.subscriptions.create("RoomChannel", {
    connected: function () {
      const gyro = new GyroNorm()
      gyro.init().then(() => {
        gyro.start(data => {
          // Start loop //
          this.perform("update", {
            gyro: data,
            draw: {
              drawing: draw,
              lock: lock,
              size: size,
              color: color
            },
            actions: {
              clear: clear,
              save: save
            }
          })

          clear = false
          save = false
          // End loop //
        })
      })
    }
  })

  const drawField = document.getElementById("draw")
  drawField.addEventListener("touchstart", () => {
    draw = true
  })
  drawField.addEventListener("touchend", () => {
    draw = false
  })

  const clearButton = document.getElementById("clear")
  clearButton.addEventListener("click", e => {
    clear = true
  })

  const saveButton = document.getElementById("save")
  saveButton.addEventListener("click", e => {
    save = true
  })

  const lockToggle = document.getElementById("lock")
  lockToggle.addEventListener("change", e => {
    lock = e.target.checked
  })

  const sizeSlider = document.getElementById("size")
  sizeSlider.addEventListener("change", e => {
    size = e.target.value
  })

  const colorRadios = document.getElementById("color")
  for (let i = 0; i < colorRadios.children.length; i++) {
    colorRadios.children.item(i).addEventListener("change", e => {
      color = e.target.value
    })
  }
}
