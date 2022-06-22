import { EMPTY, slideLine } from "./slide"

export const DIRECTIONS = ["up", "down", "left", "right"]

/** Probability that a freshly spawned tile is a 4 rather than a 2. */
const FOUR_PROBABILITY = 0.1

const mirror = grid => grid.map(row => [...row].reverse())
const transpose = grid => grid[0].map((_, c) => grid.map(row => row[c]))

/**
 * Every move is `slideLine` toward index 0 in a rotated frame, so the rule
 * lives in exactly one place and the four directions are pure bookkeeping.
 */
const ORIENTATIONS = {
  left: { toLines: grid => grid, fromLines: grid => grid },
  right: { toLines: mirror, fromLines: mirror },
  up: { toLines: transpose, fromLines: transpose },
  down: {
    toLines: grid => mirror(transpose(grid)),
    fromLines: grid => transpose(mirror(grid)),
  },
}

export const createGrid = size =>
  Array.from({ length: size }, () => Array(size).fill(EMPTY))

export const gridsEqual = (a, b) =>
  a.every((row, r) => row.every((value, c) => value === b[r][c]))

export const contains = (grid, value) => grid.some(row => row.includes(value))

export const emptyCells = grid =>
  grid.flatMap((row, r) =>
    row.flatMap((value, c) => (value === EMPTY ? [[r, c]] : []))
  )

export function move(grid, direction) {
  const { toLines, fromLines } = ORIENTATIONS[direction]
  const lines = toLines(grid).map(slideLine)
  const next = fromLines(lines.map(({ line }) => line))
  const gained = lines.reduce((total, { score }) => total + score, 0)
  return { grid: next, gained, moved: !gridsEqual(grid, next) }
}

const withTile = (grid, [row, col], value) =>
  grid.map((cells, r) =>
    r === row ? cells.map((cell, c) => (c === col ? value : cell)) : cells
  )

export function spawn(grid, rng = Math.random) {
  const cells = emptyCells(grid)
  if (!cells.length) return grid
  const cell = cells[Math.floor(rng() * cells.length)]
  return withTile(grid, cell, rng() < FOUR_PROBABILITY ? 4 : 2)
}

/**
 * The board is locked when no direction changes it. Replaying the real move is
 * 4 * O(n^2) on a 4x4 board and cannot drift out of sync with the merge rule,
 * which a hand-written "any equal neighbour" check eventually does.
 */
export const canMove = grid =>
  DIRECTIONS.some(direction => move(grid, direction).moved)
