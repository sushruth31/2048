# 2048 — the sliding tile puzzle, in React

A playable 2048 where the entire rule set lives in a pure module and React does
nothing but render it. The interesting part is the merge rule: it looks like
"collapse the row until it stops changing", and that reading is wrong — a row of
`[2 2 2 2]` must become `[4 4]`, never `[8]`. Getting that right for four
directions without writing the rule four times is the whole design.

## Stack

- **React 18** — `useReducer` only; no state library, the game state is one object.
- **Create React App 5** — already provides the Jest + Testing Library wiring and
  compiles Tailwind through its built-in PostCSS step, so there is no custom config.
- **Tailwind CSS 3** — the UI is a dozen elements; a stylesheet would be more code.
- **Jest + @testing-library/react** — ships with CRA, so the test suite adds no
  toolchain of its own.

The only runtime dependencies are React and ReactDOM.

## Running it

```bash
npm install
npm start          # http://localhost:3000

npm test           # watch mode
npm run test:ci    # single run
npm run lint
npm run build      # production bundle in build/
```

Configuration is optional. `cp .env.example .env` to change the board size or the
winning tile; the defaults (4x4, win at 2048) apply when no `.env` is present.

Arrow keys or WASD to move.

## Architecture

```
keydown ──▶ App (useReducer) ──▶ play(state, direction, rng) ──▶ new state ──▶ Board ──▶ Tile
                                        │
                                        ├── move(grid, direction)  ── orientation + slideLine
                                        ├── spawn(grid, rng)       ── new 2 or 4
                                        └── canMove(grid)          ── game-over test
```

| Module | Responsibility |
| --- | --- |
| `src/game/slide.js` | `slideLine` — the merge rule for a single line. No React, no randomness. |
| `src/game/board.js` | Grid geometry: `move`, `spawn`, `canMove`, `emptyCells`. Pure, RNG injected. |
| `src/game/index.js` | `newGame` / `play` — the state transition, including win and lock detection. |
| `src/config.js` | Reads and validates `REACT_APP_*` build-time configuration. |
| `src/App.js` | Key bindings, `useReducer`, layout. Holds no rules. |
| `src/components/` | `Board`, `Tile`, `ScoreBoard`, `StatusBar` — presentational. |
| `src/hooks/` | `useEventListener` (window keydown), `useBestScore` (localStorage). |

## Design notes

- **One rule, four directions.** `slideLine` only ever collapses toward index 0.
  Each direction is a pair of grid transforms — identity, mirror, transpose, or
  both — held in a dispatch table, applied before the slide and inverted after.
  Adding a direction is two lines; the rule itself is never duplicated. A line
  slide is a single pass, `O(n)`, so a whole move is `O(n²)` including the
  transposes.
- **The double-merge bug.** The naive implementation loops "merge equal
  neighbours" until the row is stable, which merges a tile that was itself just
  created and turns `[2 2 2 2]` into `[8]` instead of `[4 4]`. `slideLine`
  compacts once and then walks the tiles left to right, skipping the index it
  just consumed, so a merged tile is structurally ineligible for a second merge
  in the same move. Both `[2 2 2 2] → [4 4]` and `[4 4 8] → [8 8]` are pinned by
  tests.
- **Game over is the move function, replayed.** Rather than a separate
  "is any neighbour equal, is any cell free" predicate that can drift out of sync
  with the merge rule, `canMove` runs all four real moves and asks whether any of
  them changes the grid — `4 · O(n²)`, which is 64 cell visits on a 4x4 board and
  runs once per keypress. Correct by construction beats fast here.
- **Randomness is a parameter.** `spawn`, `newGame` and `play` take an `rng`
  argument defaulting to `Math.random`, so tests drive spawn placement and the
  90/10 two-versus-four split from a fixed sequence instead of mocking globals.
  That is what makes the "spawned tile locks the board" test possible to write.
- **No animation library.** The original build pulled in framer-motion for a
  single mount fade whose `x`/`y` offsets were always `undefined`, and whose
  cell keys never changed, so it played once and never again on a moving tile.
  Replacing it with a 120 ms CSS keyframe, replayed by keying
  each cell on `row-col-value` so a changed tile remounts, took the gzipped main
  bundle from **81.3 kB to 48.0 kB** — a 41% cut for the same visible behaviour.
  The keyframe is disabled under `prefers-reduced-motion`.
- **Config fails loudly.** CRA inlines `process.env.REACT_APP_*` by literal text
  substitution, so a dynamic `process.env[name]` lookup silently resolves to
  `undefined` in a production bundle. `src/config.js` therefore names each
  variable explicitly and throws on an out-of-range value with the variable and
  the accepted range in the message, rather than falling back to a default that
  quietly ignores what the operator asked for.
- **No-op moves keep their identity.** `play` returns the *same* state object
  when a direction shifts nothing, so `useReducer` bails out instead of
  re-rendering — and, more importantly, no tile is spawned for a move the player
  never actually made.

## Tests

`npm run test:ci` — 40 tests, five suites, no network or browser needed.

| Suite | Covers |
| --- | --- |
| `src/game/slide.test.js` | Merge semantics: compaction over gaps, merging across gaps, `[2 2 2 2] → [4 4]`, three-of-a-kind favouring the leading pair, no re-merge of a tile created this move, score as the sum of tiles created. |
| `src/game/board.test.js` | All four orientations against one asymmetric grid, `moved: false` on a no-op, input immutability, spawn placement and the 2-vs-4 threshold, `canMove` on a locked board, a mergeable full board, and a board with a free cell. |
| `src/game/index.test.js` | Opening board has exactly two tiles, score accumulation, exactly one spawn per move, win detection, lock detection, and that input is ignored after game over. |
| `src/config.test.js` | Defaults, environment overrides, and the three rejection paths (out of range, non-numeric, non-power-of-two) including the variable name in the error. |
| `src/App.test.js` | Keyboard wiring end to end with `Math.random` pinned: arrow keys and WASD both move and spawn, unbound keys do nothing, and restart returns to a fresh board. |

## License

MIT — see [LICENSE](LICENSE).
