// Only run on remote pages
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("remote") !== null) {
    subscribeRemote()
  }
})

function subscribeRemote () {
  let draw = false

  App.room = App.cable.subscriptions.create("RoomChannel", {
    connected: function () {
      const gyro = new GyroNorm()
      gyro.init().then(() => {
        gyro.start(data => {
          this.perform("update", { gyro: data, draw: draw })
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
}
