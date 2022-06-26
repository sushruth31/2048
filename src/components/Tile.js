const TILE_COLORS = {
  2: "#eee4da",
  4: "#ede0c8",
  8: "#f2b179",
  16: "#f59563",
  32: "#f67c5f",
  64: "#f65e3b",
  128: "#edcf72",
  256: "#edcc61",
  512: "#edc850",
  1024: "#edc53f",
  2048: "#edc22e",
}

const BEYOND_2048 = "#3c3a32"

const fontSizeFor = value =>
  value < 100 ? "2.25rem" : value < 1000 ? "1.75rem" : "1.375rem"

export default function Tile({ value }) {
  if (!value) return <div className="aspect-square rounded-md bg-[#cdc1b4]" />

  return (
    <div
      className="tile aspect-square rounded-md flex items-center justify-center font-bold"
      style={{
        backgroundColor: TILE_COLORS[value] ?? BEYOND_2048,
        color: value > 4 ? "#f9f6f2" : "#776e65",
        fontSize: fontSizeFor(value),
      }}
    >
      {value}
    </div>
  )
}
