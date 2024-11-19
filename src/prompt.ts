import { GameState } from "./logic"

export const INITIAL_PROMPT =
  "We are playing a game. You will write a story based on the input given from players.\n" +
  "You should start by generating the first few lines of a short story around 300 characters in length and provide it on a line starting with Output:.\n" +
  "The user will then provide terms to include in the story on a line starting with Input:.\n" +
  "You should then generate a few more lines of the story including the terms provided.\n" +
  "You should also provide 10 suggestions for terms to feature in the next part of the story on a line starting with Suggestions:. Suggestions should be one or two words only, never more.\n" +
  "After a few rounds the user will provide the last set of terms with a line starting with EndInput:.\n" +
  "You should generate the end of the story with the final terms and conclude the story.\n" +
  "The example below is for structure only. Write the story without considering its content and come up with new ideas. Try to make the story as funny as possible.\n" +
  "\nExample 1: " +
  "\n" +
  "Output: There was a small boy who found a golden nugget in the sand. He wondered what it was so he took it to merchant.\n" +
  "Suggestions: boat, dog, cat, britney spears, banana, glue, phone booth, car, hotel room, pickaxe.\n" +
  "Input: Cat, Britney Spears, The Moon\n" +
  "Output: The merchant said my name is Britney Spears and I've traveled far and wide and seen many things. The nugget you have there seems to be part of the moon. Try feeding it to my cat, he loves moon rocks.\n" +
  "Suggestions: Ocean Breeze, Cloud, Stone Arch, Mirror, Candle Light, Picnic Basket, Lantern, Velvet Ribbon, Feather, Silver Key\n" +
  "Input: Sick, Bad News, Mints\n" +
  "Output: As the cat ate the moon rock it began to cough and splutter and was promptly very Sick. 'Bad News' said Britney, that wasn't a rock but a Mint and cats are allergic to mints.\n" +
  "Suggestions: Seashell, Torn Map, Autumn Leaf, Bell Tower, Rusty Nail, Wool Scarf, Ivy Vine, Chain Link, Paperback Book, Paper Plane\n" +
  "EndInput: Doctor, Donald Trump, Medicine\n" +
  "Output: The merchant and the small boy rushed to the Doctor who lived next door. On the door there was a sign that read 'Donald Trump, MD'. The doctor took one look at the cat and grabbed a bottle of medicine feeding it to the cat. Everyone live happily ever after!\n" +
  "\n" +
  "\nExample 2: " +
  "\n" +
  "Output: Once there was a teapot. It was magical and could brew the most exciting drinks inside it. The sun rose early that day and town folk found the teapot.\n" +
  "Suggestions: Steel Bridge, Mountain Trail, Shooting Star, Diamond Ring, Fairy Dust, Thunder Cloud, City Park, Garden Fence, Dance Floor, Sword\n" +
  "Input: Microphone, Drinks Bottle, Carrot\n" +
  "Output: The mayor of the town took the Microphone and talked to the towns people. 'We shall put something in the teapot' and fill our Drinks Bottle from it. A old man shouted, 'Add the Carrot!' \n" +
  "Suggestions: Paper Lantern, Sunset Beach, Snow Drift, Rail Line, Fishing Boat, Tower Watch, Flame Torch, Red Cape, Copper Wire, Desert Wind\n" +
  "Output: The mayor took the carrot and placed it in the tea pot. He instructed the town photographer to record the event on a USB stick. As the teapot bubble on the fire they waited to taste the drink. It turned out to taste a lot like Red Bull.\n" +
  "Suggestions: Mossy Rock, Evergreen Tree, Crystal Pond, Wooden Hut, Iron Gate, Open Door, Forest Path, Meadow Field, Garden Bench, Ship Rope\n" +
  "EndInput: Gun, Ship, Tears\n" +
  "Output: As the water bottle was filled one of the townsfolk took our a gun. 'It's mine, back off' he said. Grabbing the teapot the man ran away to a ship and sailed away. The town folks cried salty tears for days.\n" +
  "\n" +
  "Generate the start of the story now."

export function runPrompt(
  game: GameState,
  message: string,
  role: string = "user"
) {
  if (game.prompting) {
    console.log("Tried to prompt more than once")
    return
  }
  game.aiHistory.push({
    role,
    content: message,
  })
  const nonProxiedMessages = JSON.parse(JSON.stringify(game.aiHistory))
  game.prompting = true
  Rune.ai.promptRequest({
    messages: nonProxiedMessages,
  })
}
