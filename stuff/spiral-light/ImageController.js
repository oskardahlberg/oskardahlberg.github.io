'use strict'

function ImageController () {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  let image = new Image()

  this.setImage = newImage => {
    image = newImage
    canvas.width = image.width
    canvas.height  = image.height
    context.drawImage(image, 0, 0)
  }

  this.getColor = (x, y, width = 1, height = 1) => {
    x = x % (image.width || 1)
    y = y % (image.height || 1)

    if (x < 0) x = image.width + x
    if (y < 0) y = image.height + y

    return Array.from(
      context.getImageData(x, y, width, height).data
    ).slice(0, 3)
  }

  this.getColors = (n, x, y, width = 1, height = 1) => {
    const colors = []
    const range = image.width / (n - 1)
    for (let i = 0; i < n; i++) {
      colors.push(this.getColor(x + Math.round(i * range), y, width, height))
    }
    return colors
  }
}