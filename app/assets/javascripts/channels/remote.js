// Only run on remote pages
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("remote") !== null) {
    subscribeRemote()
  }
})

function subscribeRemote () {
  let drawing = false
  let fill = false
  let lock = false
  let size = document.getElementById("size").value
  let color = "black"
  let clear = false
  let save = false
  let tune = false
  let release = true

  App.room = App.cable.subscriptions.create("RoomChannel", {
    connected: function () {
      const gyro = new GyroNorm()
      gyro.init().then(() => {
        gyro.start(data => {
          // Start loop //
          this.perform("update", {
            gyro: data,
            draw: {
              drawing: drawing,
              lock: lock,
              size: size,
              color: color,
              fill: fill,
              release: release
            },
            actions: {
              clear: clear,
              save: save,
              tune: tune
            }
          })

          release = !drawing

          clear = false
          save = false
          tune = false
          // End loop //
        })
      })
    }
  })

  const drawingField = document.getElementById("draw")
  drawingField.addEventListener("touchstart", () => {
    drawing = true
  })
  drawingField.addEventListener("touchend", () => {
    drawing = false
  })

  const clearButton = document.getElementById("clear")
  clearButton.addEventListener("click", e => {
    clear = true
  })

  const saveButton = document.getElementById("save")
  saveButton.addEventListener("click", e => {
    save = true
  })

  const tuneButton = document.getElementById("tune")
  tuneButton.addEventListener("click", e => {
    tune = true
  })

  const lockToggle = document.getElementById("lock")
  lockToggle.addEventListener("change", e => {
    lock = e.target.checked
  })

  const fillToggle = document.getElementById("fill")
  fillToggle.addEventListener("change", e => {
    fill = e.target.checked
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
