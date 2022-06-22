export const EMPTY = 0

const pad = (tiles, length) => [
  ...tiles,
  ...Array(length - tiles.length).fill(EMPTY),
]

/**
 * Collapses one line toward index 0 under the 2048 merge rule: tiles compact
 * over gaps, each pair merges at most once per move, and the merged tile is
 * never eligible for a second merge in the same move. O(n) in the line length.
 */
export function slideLine(line) {
  const tiles = line.filter(value => value !== EMPTY)
  const collapsed = []
  let score = 0

  for (let i = 0; i < tiles.length; i++) {
    const merges = tiles[i] === tiles[i + 1]
    const value = merges ? tiles[i] * 2 : tiles[i]
    collapsed.push(value)
    score += merges ? value : 0
    i += merges ? 1 : 0
  }

  return { line: pad(collapsed, line.length), score }
}
