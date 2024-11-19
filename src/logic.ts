import type { PlayerId, RuneClient } from "rune-sdk"
import { INITIAL_PROMPT, runPrompt } from "./prompt"

type Prompt = { role: string; content: string }

export type StoryPart = {
  text: string
  suggestions: string[]
}

export interface GameState {
  parts: StoryPart[]
  playerTerms: Record<PlayerId, string>
  allTerms: Record<PlayerId, string[]>
  nextPhaseAt: number
  started: boolean
  waitingForStory: boolean
  aiHistory: Prompt[]
  prompting: boolean
}

type GameActions = {
  submitTerm: (term: string) => void
  start: () => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 6,
  setup: () => {
    return {
      parts: [],
      playerTerms: {},
      allTerms: {},
      nextPhaseAt: 0,
      started: false,
      waitingForStory: false,
      aiHistory: [],
      prompting: false,
    }
  },
  events: {
    playerJoined: () => {
      // do nothing, we just let them join
    },
    playerLeft: (playerId, { game }) => {
      delete game.playerTerms[playerId]
    },
  },
  ai: {
    promptResponse: ({ response }, { game }) => {
      game.prompting = false

      game.aiHistory.push({
        role: "assistant",
        content: response,
      })

      // parse the response
      const parts = response.split("\n")
      const storyPart: StoryPart = {
        text: "",
        suggestions: [],
      }
      for (const part of parts) {
        if (part.startsWith("Output:")) {
          storyPart.text = part.substring("Output:".length).trim()
        }
        if (part.startsWith("Suggestions:")) {
          storyPart.suggestions = part
            .substring("Suggestions:".length)
            .split(",")
            .map((i) => i.trim())

          // AI puts full stops on things, filter these out
          for (let i = 0; i < storyPart.suggestions.length; i++) {
            if (storyPart.suggestions[i].endsWith(".")) {
              storyPart.suggestions[i] = storyPart.suggestions[i].substring(
                0,
                storyPart.suggestions[i].length - 1
              )
            }
          }
        }
      }

      if (storyPart.text === "") {
        // failed response
      } else {
        game.parts.push(storyPart)
      }
    },
  },
  actions: {
    submitTerm: (term, { game, playerId, allPlayerIds }) => {
      game.playerTerms[playerId] = term

      if (!game.allTerms[playerId]) {
        game.allTerms[playerId] = []
      }
      game.allTerms[playerId].push(term)

      // check to see if all players have submitted terms
      let terms = ""
      for (const playerId of allPlayerIds) {
        if (!game.playerTerms[playerId]) {
          return
        }

        if (terms !== "") {
          terms += ","
        }
        terms += game.playerTerms[playerId]
      }

      const prefix = game.parts.length === 2 ? "EndInput: " : "Input: "

      runPrompt(game, prefix + terms, "user")
      game.playerTerms = {}
    },
    start: (_, { game }) => {
      if (!game.started) {
        game.started = true
        runPrompt(game, INITIAL_PROMPT, "user")
      }
    },
  },
})
