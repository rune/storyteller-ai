import { PlayerId } from "rune-sdk"
import "./styles.css"
import { GameState } from "./logic"
import { shareStory } from "./share"

const ROUNDS = 3

function div(id: string): HTMLDivElement {
  return document.getElementById(id) as HTMLDivElement
}

function updatePlayers(game: GameState, allPlayersId: PlayerId[]) {
  // remove any players that have left
  const playerElements = document.getElementsByClassName("player")
  for (const e of [...playerElements]) {
    if (!allPlayersId.includes(e.id)) {
      e.parentNode?.removeChild(e)
    }
  }

  for (const playerId of allPlayersId) {
    const existing = document.getElementById(playerId)
    if (!existing) {
      const playerElement = document.createElement("img")
      playerElement.id = playerId
      playerElement.src = Rune.getPlayerInfo(playerId).avatarUrl
      playerElement.classList.add("player")
      div("players").appendChild(playerElement)
    }
  }
}

function showError(message: string) {
  div("error").style.display = "block"
  div("error").innerHTML = message
}

function clearError() {
  div("error").style.display = "none"
}

div("startTheStory").addEventListener("click", () => {
  Rune.actions.start()
})

div("shareButton").addEventListener("click", () => {
  shareStory(fullText, terms)
})

div("addButton").addEventListener("click", () => {
  const term = (document.getElementById("playerInput") as HTMLInputElement)
    .value
  if (term.trim() === "") {
    showError("Enter a term first")
    return
  }
  if (term.trim().split(" ").length > 2) {
    showError("One or two words only")
    return
  }
  clearError()
  ;(document.getElementById("playerInput") as HTMLInputElement).value = ""
  Rune.actions.submitTerm(term)
})
;(document.getElementById("playerInput") as HTMLInputElement).addEventListener(
  "input",
  () => {
    clearError()
  }
)

let currentScreen = "startScreen"
let fullText = ""
let terms: Record<PlayerId, string[]> = {}

function showScreen(screen: string) {
  if (screen !== currentScreen) {
    div(currentScreen).classList.add("disabled")
    div(currentScreen).classList.remove("enabled")

    currentScreen = screen

    div(currentScreen).classList.remove("off")
    div(currentScreen).classList.remove("disabled")
    div(currentScreen).classList.add("enabled")
  }
}
let gameStarted = false

function formatStory(allPlayerIds: PlayerId[], game: GameState, text: string) {
  for (const playerId of allPlayerIds) {
    const avatarUrl = Rune.getPlayerInfo(playerId).avatarUrl
    if (game.allTerms[playerId]) {
      for (const term of game.allTerms[playerId]) {
        const regEx = new RegExp(term, "ig")
        const span = `<span class="term">${term}<img class="termAvatar" src="${avatarUrl}"></img></span>`

        text = text.replace(regEx, span)
      }
    }
  }
  return text
}

Rune.initClient({
  onChange: ({ allPlayerIds, game, yourPlayerId }) => {
    updatePlayers(game, allPlayerIds)

    if (game.started && !gameStarted) {
      gameStarted = true
      div("startScreen").classList.add("disabled")
    }

    if (game.started) {
      if (game.prompting) {
        showScreen("thinkingScreen")
      } else {
        if (yourPlayerId && game.playerTerms[yourPlayerId]) {
          div("waitingForOtherPlayers").style.display = "block"
          div("playerInputControls").style.display = "none"
        } else {
          div("waitingForOtherPlayers").style.display = "none"
          div("playerInputControls").style.display = "block"
        }
        if (game.parts.length < ROUNDS) {
          if (currentScreen !== "inputScreen") {
            showScreen("inputScreen")
            const storyPart = game.parts[game.parts.length - 1]
            div("textSection").innerHTML = formatStory(
              allPlayerIds,
              game,
              storyPart.text
            )
            div("textSection").scrollTop = 0
            div("suggestionsList").innerHTML = ""

            let suggestions = [...storyPart.suggestions]
            for (let i = 0; i < 3; i++) {
              const suggestion =
                suggestions[Math.floor(suggestions.length * Math.random())]

              // remove the suggestion so we don't pick it again
              suggestions = suggestions.filter((s) => s !== suggestion)
              const suggestionDiv = document.createElement("div")
              suggestionDiv.classList.add("suggestion")
              suggestionDiv.innerHTML = suggestion
              suggestionDiv.addEventListener("click", () => {
                ;(
                  document.getElementById("playerInput") as HTMLInputElement
                ).value = suggestion
              })
              div("suggestionsList").appendChild(suggestionDiv)
            }
          }
        } else {
          if (currentScreen !== "endScreen") {
            showScreen("endScreen")
            fullText = game.parts.map((part) => part.text).join("\n\n")
            terms = game.allTerms
            div("fullTextSection").innerHTML = formatStory(
              allPlayerIds,
              game,
              game.parts.map((part) => part.text).join("<p>")
            )
            div("fullTextSection").scrollTop = 0
          }
        }
      }
    }
  },
})
