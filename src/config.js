/**
 * Build-time configuration. Create React App inlines `process.env.REACT_APP_*`
 * by literal substitution, so each variable must be referenced by its full
 * name here — a dynamic `process.env[name]` lookup resolves to undefined in
 * the production bundle.
 */
const RULES = {
  boardSize: {
    describe: "an integer between 2 and 8",
    accepts: value => value >= 2 && value <= 8,
  },
  winTile: {
    describe: "a power of two of at least 8",
    accepts: value => value >= 8 && (value & (value - 1)) === 0,
  },
}

function intFromEnv(name, raw, fallback, rule) {
  if (raw === undefined || raw === "") return fallback
  const value = Number(raw)
  if (!Number.isInteger(value) || !rule.accepts(value)) {
    throw new Error(`${name}="${raw}" is invalid: expected ${rule.describe}.`)
  }
  return value
}

export const BOARD_SIZE = intFromEnv(
  "REACT_APP_BOARD_SIZE",
  process.env.REACT_APP_BOARD_SIZE,
  4,
  RULES.boardSize
)

export const WIN_TILE = intFromEnv(
  "REACT_APP_WIN_TILE",
  process.env.REACT_APP_WIN_TILE,
  2048,
  RULES.winTile
)
