import Tile from "./Tile"

/**
 * The cell key carries the value so a changed tile remounts and replays the
 * CSS pop animation; position is owned by the grid, not by the tile.
 */
export default function Board({ grid }) {
  return (
    <div
      className="grid gap-2 rounded-lg bg-[#bbada0] p-2"
      style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}
    >
      {grid.flatMap((row, r) =>
        row.map((value, c) => <Tile key={`${r}-${c}-${value}`} value={value} />)
      )}
    </div>
  )
}
