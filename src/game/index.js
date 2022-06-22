import { BOARD_SIZE, WIN_TILE } from "../config"
import { canMove, contains, createGrid, move, spawn } from "./board"

export { DIRECTIONS } from "./board"

export function newGame(size = BOARD_SIZE, rng = Math.random) {
  const grid = spawn(spawn(createGrid(size), rng), rng)
  return { grid, score: 0, won: false, over: false }
}

/** Applies one move. Returns the same state object when nothing shifts. */
export function play(state, direction, rng = Math.random) {
  if (state.over) return state

  const { grid, gained, moved } = move(state.grid, direction)
  if (!moved) return state

  const next = spawn(grid, rng)
  return {
    grid: next,
    score: state.score + gained,
    won: state.won || contains(next, WIN_TILE),
    over: !canMove(next),
  }
}
