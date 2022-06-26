import { useReducer } from "react"
import Board from "./components/Board"
import ScoreBoard from "./components/ScoreBoard"
import StatusBar from "./components/StatusBar"
import useBestScore from "./hooks/useBestScore"
import useEventListener from "./hooks/useEventListener"
import { newGame, play } from "./game"

const KEY_DIRECTIONS = {
  arrowup: "up",
  arrowdown: "down",
  arrowleft: "left",
  arrowright: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
}

const reduce = (game, action) =>
  action.type === "restart" ? newGame() : play(game, action.direction)

const handleKey = (event, dispatch) => {
  const direction = KEY_DIRECTIONS[event.key.toLowerCase()]
  if (!direction) return
  event.preventDefault()
  dispatch({ type: "move", direction })
}

export default function App() {
  const [game, dispatch] = useReducer(reduce, undefined, () => newGame())
  const best = useBestScore(game.score)

  useEventListener("keydown", event => handleKey(event, dispatch))

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 p-4">
      <header className="flex items-end justify-between">
        <h1 className="text-4xl font-bold text-[#776e65]">2048</h1>
        <ScoreBoard score={game.score} best={best} />
      </header>
      <Board grid={game.grid} />
      <StatusBar game={game} onRestart={() => dispatch({ type: "restart" })} />
    </main>
  )
}
