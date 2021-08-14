function drawIcon(value) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  context.beginPath()
  context.fillStyle = value.color
  context.arc(100, 100, 50, 0, 2 * Math.PI)
  context.fill()

  return context.getImageData(50, 50, 100, 100)
}

chrome.runtime.onMessage.addListener(function (msg) {
  if (msg.action === 'updateIcon') {
    chrome.browserAction.setIcon({ imageData: drawIcon(msg.value) })
  }
})
