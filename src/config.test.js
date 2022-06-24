/**
 * Under Jest, `process.env.REACT_APP_*` is a live lookup, so the module can be
 * re-imported per case. Webpack inlines the same expressions for the bundle.
 */
const loadConfig = () => {
  jest.resetModules()
  return require("./config")
}

const VARIABLES = ["REACT_APP_BOARD_SIZE", "REACT_APP_WIN_TILE"]

beforeEach(() => VARIABLES.forEach(name => delete process.env[name]))

describe("config", () => {
  it("falls back to a 4x4 board that wins at 2048", () => {
    const { BOARD_SIZE, WIN_TILE } = loadConfig()
    expect(BOARD_SIZE).toBe(4)
    expect(WIN_TILE).toBe(2048)
  })

  it("reads overrides from the environment", () => {
    process.env.REACT_APP_BOARD_SIZE = "5"
    process.env.REACT_APP_WIN_TILE = "1024"
    expect(loadConfig().BOARD_SIZE).toBe(5)
    expect(loadConfig().WIN_TILE).toBe(1024)
  })

  it("rejects a board size outside the supported range, naming the variable", () => {
    process.env.REACT_APP_BOARD_SIZE = "1"
    expect(loadConfig).toThrow(/REACT_APP_BOARD_SIZE="1"/)
  })

  it("rejects a non-numeric board size", () => {
    process.env.REACT_APP_BOARD_SIZE = "four"
    expect(loadConfig).toThrow(/an integer between 2 and 8/)
  })

  it("rejects a win tile that is not a power of two", () => {
    process.env.REACT_APP_WIN_TILE = "1000"
    expect(loadConfig).toThrow(/a power of two of at least 8/)
  })
})
