import { canMove, emptyCells, move, spawn } from "./board"

const GRID = [
  [2, 0, 0, 2],
  [0, 4, 4, 0],
  [0, 0, 0, 0],
  [8, 0, 0, 0],
]

/** Deterministic stand-in for Math.random, consumed one value per call. */
const seededRng = values => {
  let index = 0
  return () => values[index++]
}

describe("move", () => {
  it("collapses rows toward the left edge", () => {
    expect(move(GRID, "left")).toEqual({
      grid: [
        [4, 0, 0, 0],
        [8, 0, 0, 0],
        [0, 0, 0, 0],
        [8, 0, 0, 0],
      ],
      gained: 12,
      moved: true,
    })
  })

  it("collapses rows toward the right edge", () => {
    expect(move(GRID, "right").grid).toEqual([
      [0, 0, 0, 4],
      [0, 0, 0, 8],
      [0, 0, 0, 0],
      [0, 0, 0, 8],
    ])
  })

  it("collapses columns toward the top edge", () => {
    expect(move(GRID, "up").grid).toEqual([
      [2, 4, 4, 2],
      [8, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
  })

  it("collapses columns toward the bottom edge", () => {
    expect(move(GRID, "down").grid).toEqual([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 0, 0],
      [8, 4, 4, 2],
    ])
  })

  it("reports moved: false when the grid is unchanged", () => {
    const packed = [
      [2, 4],
      [8, 16],
    ]
    expect(move(packed, "left").moved).toBe(false)
    expect(move(packed, "up").moved).toBe(false)
  })

  it("does not mutate the grid it was given", () => {
    const before = JSON.stringify(GRID)
    move(GRID, "down")
    expect(JSON.stringify(GRID)).toBe(before)
  })
})

describe("emptyCells", () => {
  it("lists free cells in row-major order", () => {
    expect(emptyCells([[2, 0], [0, 4]])).toEqual([
      [0, 1],
      [1, 0],
    ])
  })
})

describe("spawn", () => {
  it("places a tile in the cell selected by the random source", () => {
    const grid = spawn(
      [
        [0, 0],
        [0, 0],
      ],
      seededRng([0.5, 0.5])
    )
    expect(grid).toEqual([
      [0, 0],
      [2, 0],
    ])
  })

  it("spawns a 4 only in the bottom decile of the random draw", () => {
    const empty = [
      [0, 0],
      [0, 0],
    ]
    expect(spawn(empty, seededRng([0, 0.05]))[0][0]).toBe(4)
    expect(spawn(empty, seededRng([0, 0.11]))[0][0]).toBe(2)
  })

  it("returns the same grid when there is no free cell", () => {
    const full = [
      [2, 4],
      [8, 16],
    ]
    expect(spawn(full, seededRng([0.5, 0.5]))).toBe(full)
  })
})

describe("canMove", () => {
  it("is false for a full board whose neighbours all differ", () => {
    expect(
      canMove([
        [2, 4],
        [4, 2],
      ])
    ).toBe(false)
  })

  it("is true for a full board that still holds a mergeable pair", () => {
    expect(
      canMove([
        [2, 2],
        [4, 8],
      ])
    ).toBe(true)
  })

  it("is true whenever a cell is free", () => {
    expect(
      canMove([
        [2, 4],
        [8, 0],
      ])
    ).toBe(true)
  })
})
