import { fireEvent, render, screen } from "@testing-library/react"
import App from "./App"

/** A fixed random source makes the opening board and every spawn reproducible. */
beforeEach(() => {
  window.localStorage.clear()
  jest.spyOn(Math, "random").mockReturnValue(0.5)
})

afterEach(() => jest.restoreAllMocks())

describe("App", () => {
  it("opens with two tiles and both score readouts at zero", () => {
    render(<App />)
    expect(screen.getAllByText("2")).toHaveLength(2)
    expect(screen.getAllByText("0")).toHaveLength(2)
  })

  it("moves the board on an arrow key and spawns one new tile", () => {
    render(<App />)
    fireEvent.keyDown(window, { key: "ArrowLeft" })
    expect(screen.getAllByText("2")).toHaveLength(3)
  })

  it("accepts WASD as well as the arrow keys", () => {
    render(<App />)
    fireEvent.keyDown(window, { key: "a" })
    expect(screen.getAllByText("2")).toHaveLength(3)
  })

  it("ignores keys that are not bound to a direction", () => {
    render(<App />)
    fireEvent.keyDown(window, { key: "Enter" })
    expect(screen.getAllByText("2")).toHaveLength(2)
  })

  it("restarts to a fresh board", () => {
    render(<App />)
    fireEvent.keyDown(window, { key: "ArrowLeft" })
    fireEvent.click(screen.getByRole("button", { name: "New game" }))
    expect(screen.getAllByText("2")).toHaveLength(2)
  })
})
