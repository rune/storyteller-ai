import { PlayerId } from "rune-sdk"
import shareBackgroundUrl from "./assets/share.png"

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve) => {
    const image = new Image()
    image.src = src
    image.crossOrigin = "anonymous"
    image.addEventListener("load", () => {
      resolve(image)
    })
  })
}

function getPlayerTerm(term: string, allTerms: Record<PlayerId, string[]>) {
  term = term.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
  for (const playerId of Object.keys(allTerms)) {
    for (const playerTerm of allTerms[playerId]) {
      const cleanPlayerTerm = playerTerm
        .toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      if (cleanPlayerTerm === term) {
        // matching term
        return playerId
      }
    }
  }

  return undefined
}

export async function shareStory(
  text: string,
  terms: Record<PlayerId, string[]>
) {
  const backgroundImage = await loadImage(shareBackgroundUrl)
  const playerImages: Record<PlayerId, HTMLImageElement> = {}
  for (const playerId of Object.keys(terms)) {
    const info = Rune.getPlayerInfo(playerId)
    if (info) {
      playerImages[playerId] = await loadImage(info.avatarUrl)
    }
  }
  const canvas = document.createElement("canvas")
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext("2d")

  if (ctx) {
    ctx.drawImage(backgroundImage, 0, 0)

    ctx.translate(150, 550)
    // render word by word so we can highlight the ones that were provided as terms
    const textSize = 35
    ctx.font = textSize + "px Basker"
    const maxWidth = 800
    text = text.replaceAll("\n", " *n* ")
    const words = text.split(" ")
    let y = 0
    let x = 0
    for (let i = 0; i < words.length; i++) {
      let word = words[i]
      let playerTermId = getPlayerTerm(word, terms)
      if (!playerTermId) {
        const possibleTerm = word + " " + words[i + 1]
        playerTermId = getPlayerTerm(possibleTerm, terms)
        if (playerTermId) {
          i++
          word = possibleTerm
        }
      }

      if (playerTermId && !playerImages[playerTermId]) {
        playerTermId = undefined
      }

      if (word === "*n*") {
        y += textSize
        x = 0
      } else {
        const metrics = ctx.measureText(word + " ")
        if (metrics.width + x > maxWidth) {
          y += textSize
          x = 0
        }

        if (playerTermId) {
          ctx.fillStyle = "black"
          ctx.fillRect(x, y - textSize + 3, metrics.width + 32, textSize + 6)
          x += 4
        }
        ctx.fillStyle = "rgba(0,0,0,0.5)"
        ctx.fillText(word, x + 3, y + 3)
        ctx.fillStyle = "#FFF1DB"
        ctx.fillText(word, x, y)
        x += metrics.width
        if (playerTermId) {
          // can't do this
          ctx.drawImage(
            playerImages[playerTermId],
            x - 4,
            y - textSize + 12,
            textSize - 6,
            textSize - 6
          )
          x += 32
        }
      }
    }

    Rune.showShareImage(canvas.toDataURL("image/png", 1))
  }
}
