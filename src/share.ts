import { PlayerId } from "rune-sdk"
import shareBackgroundUrl from "./assets/share.png"

const image = new Image()
image.src = shareBackgroundUrl

export function shareStory(text: string, terms: Record<PlayerId, string[]>) {
  const canvas = document.createElement("canvas")
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext("2d")

  if (ctx) {
    ctx.drawImage(image, 0, 0)

    ctx.translate(150, 550)
    // render word by word so we can highlight the ones that were provided as terms
    const textSize = 35
    ctx.font = textSize + "px Basker"
    const maxWidth = 800
    text = text.replaceAll("\n", " *n* ")
    const words = text.split(" ")
    let y = 0
    let x = 0
    for (const word of words) {
      if (word === "*n*") {
        y += textSize
        x = 0
      } else {
        const metrics = ctx.measureText(word + " ")
        if (metrics.width + x > maxWidth) {
          y += textSize
          x = 0
        }
        ctx.fillStyle = "rgba(0,0,0,0.5)"
        ctx.fillText(word, x + 3, y + 3)
        ctx.fillStyle = "#FFF1DB"
        ctx.fillText(word, x, y)
        x += metrics.width
      }
    }

    Rune.showShareImage(canvas.toDataURL("image/png", 1))
  }
}
