import { toKey } from "./App"

export default function Grid({
  onCellClick = () => {},
  numRows,
  numCols,
  renderCell: RenderCell = () => null,
  ...props
}) {
  return (
    <div {...props} className="bg-[#baaca0] p-2">
      {Array.from(Array(numRows)).map((_, rowI) => {
        return (
          <div className="flex" key={rowI}>
            {Array.from(Array(numCols)).map((_, colI) => {
              let cellKey = toKey([rowI, colI])
              return (
                <div
                  onClick={e => onCellClick(cellKey, e)}
                  className="w-[140px] bg-[#ccc1b4] cursor-pointer flex items-center justify-center h-[140px] border-4 border-[#baaca0] rounded-lg"
                  key={colI}
                >
                  <RenderCell cellKey={cellKey} colI={colI} rowI={rowI} />
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
