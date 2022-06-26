import { WIN_TILE } from "../config"

const message = ({ won, over }) => {
  if (over) return "No moves left."
  if (won) return `You reached ${WIN_TILE}. Keep going.`
  return "Arrow keys or WASD to move."
}

export default function StatusBar({ game, onRestart }) {
  return (
    <div className="flex items-center justify-between text-[#776e65]">
      <p>{message(game)}</p>
      <button
        type="button"
        onClick={onRestart}
        className="rounded-md bg-[#8f7a66] px-4 py-2 font-bold text-[#f9f6f2]"
      >
        New game
      </button>
    </div>
  )
}
