import { newGame, play } from "./index"

const seededRng = values => {
  let index = 0
  return () => values[index++]
}

/** Picks the middle free cell and always spawns a 2. */
const middleRng = () => seededRng([0.5, 0.5, 0.5, 0.5])

const stateOf = (grid, extra = {}) => ({
  grid,
  score: 0,
  won: false,
  over: false,
  ...extra,
})

describe("newGame", () => {
  it("opens a board of the configured size with exactly two tiles", () => {
    const { grid, score, over } = newGame()
    expect(grid).toHaveLength(4)
    expect(grid.flat().filter(Boolean)).toHaveLength(2)
    expect(score).toBe(0)
    expect(over).toBe(false)
  })

  it("places both opening tiles through the injected random source", () => {
    expect(newGame(2, middleRng())).toEqual(
      stateOf([
        [0, 2],
        [2, 0],
      ])
    )
  })
})

describe("play", () => {
  it("returns the identical state when the move shifts nothing", () => {
    const state = stateOf([
      [2, 4],
      [8, 16],
    ])
    expect(play(state, "left", middleRng())).toBe(state)
  })

  it("adds the merge value to the running score", () => {
    const state = stateOf(
      [
        [2, 2],
        [0, 0],
      ],
      { score: 10 }
    )
    expect(play(state, "left", middleRng()).score).toBe(14)
  })

  it("spawns exactly one tile after a move that shifts the board", () => {
    const state = stateOf([
      [2, 2],
      [0, 0],
    ])
    expect(play(state, "left", middleRng()).grid.flat().filter(Boolean)).toHaveLength(2)
  })

  it("ends the game when the spawned tile locks the board", () => {
    const state = stateOf([
      [2, 4],
      [0, 4],
    ])
    const next = play(state, "left", middleRng())
    expect(next.grid).toEqual([
      [2, 4],
      [4, 2],
    ])
    expect(next.over).toBe(true)
  })

  it("flags a win when the target tile appears", () => {
    const state = stateOf([
      [1024, 1024],
      [2, 4],
    ])
    const next = play(state, "left", middleRng())
    expect(next.won).toBe(true)
    expect(next.score).toBe(2048)
  })

  it("ignores further input once the game is over", () => {
    const state = stateOf(
      [
        [2, 4],
        [4, 2],
      ],
      { over: true }
    )
    expect(play(state, "left", middleRng())).toBe(state)
  })
})
