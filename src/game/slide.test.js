import { slideLine } from "./slide"

describe("slideLine", () => {
  it("compacts tiles over gaps without merging unequal neighbours", () => {
    expect(slideLine([2, 0, 0, 4])).toEqual({ line: [2, 4, 0, 0], score: 0 })
  })

  it("merges an adjacent pair and scores the resulting tile", () => {
    expect(slideLine([0, 2, 2, 0])).toEqual({ line: [4, 0, 0, 0], score: 4 })
  })

  it("merges across gaps once the line is compacted", () => {
    expect(slideLine([2, 0, 2, 0])).toEqual({ line: [4, 0, 0, 0], score: 4 })
  })

  it("merges a four-of-a-kind row into two tiles, not one", () => {
    expect(slideLine([2, 2, 2, 2])).toEqual({ line: [4, 4, 0, 0], score: 8 })
  })

  it("merges the leading pair when three tiles match", () => {
    expect(slideLine([2, 2, 2, 0])).toEqual({ line: [4, 2, 0, 0], score: 4 })
  })

  it("does not re-merge a tile created by this same move", () => {
    expect(slideLine([4, 4, 8, 0])).toEqual({ line: [8, 8, 0, 0], score: 8 })
  })

  it("leaves a line with no gaps and no equal neighbours untouched", () => {
    expect(slideLine([2, 4, 8, 16])).toEqual({
      line: [2, 4, 8, 16],
      score: 0,
    })
  })

  it("returns an empty line unchanged", () => {
    expect(slideLine([0, 0, 0, 0])).toEqual({ line: [0, 0, 0, 0], score: 0 })
  })

  it("scores the sum of every tile created, not the number of merges", () => {
    expect(slideLine([8, 8, 4, 4]).score).toBe(24)
  })
})
