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

  App.room = App.cable.subscriptions.create("RoomChannel", {
    connected: function () {
      const gyro = new GyroNorm()
      gyro.init().then(() => {
        gyro.start(data => {
          this.perform("update", {
            gyro: data,
            draw: {
              drawing: draw,
            lock: lock,
              size: size,
              color: color
            }
          })
        })
      })
    }
  })

  const drawButton = document.getElementById("draw")
  drawButton.addEventListener("touchstart", () => {
    draw = true
  })
  drawButton.addEventListener("touchend", () => {
    draw = false
  })

  const lockToggle = document.getElementById("lock")
  lockToggle.addEventListener("change", e => {
    lock = e.target.checked
  })

  const sizeSlider = document.getElementById("size")
  sizeSlider.addEventListener("change", e => {
    size = e.target.value
  })
}
