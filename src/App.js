import { useState } from "react"
import Grid from "./grid"
import useEventListener from "./useEventListener"

const NUM_ROWS = 4
const NUM_COLS = 4

export function toKey(arr) {
  return arr[0] + "-" + arr[1]
}

export function toArr(key) {
  return key.split("-").map(Number)
}

function iterateGrid(f) {
  for (let i = 0; i < NUM_ROWS; i++) {
    for (let j = 0; j < NUM_COLS; j++) {
      f({ key: toKey([i, j]), r: i, c: j })
    }
  }
}

const colorMap = {
  2: "#eee4da",
  4: "#eee1c9",
  8: "#f3b279",
  16: "#f79664",
  32: "#e7785a",
}

function getRandomKey() {
  let r = Math.floor(Math.random() * NUM_ROWS)
  let c = Math.floor(Math.random() * NUM_COLS)
  return toKey([r, c])
}

function initMap(n) {
  //todo add local storage
  let map = new Map(Array.from(Array(n)).map(() => [getRandomKey(), 2]))
  return map.size !== n ? initMap(n) : map
}

function mapToArr(map) {
  let arr = []
  for (let i = 0; i < NUM_ROWS; i++) {
    let a = []
    for (let j = 0; j < NUM_COLS; j++) {
      let key = toKey([i, j])
      a.push({ key, val: map.get(key) })
    }
    arr.push(a)
  }
  return arr
}

function reduceLeft(arr) {
  //fitler nulls and move to right
  let filteredArr = arr.filter(el => el != null)
  let numNulls = arr.length - filteredArr.length
  arr = [
    ...filteredArr,
    ...(!numNulls ? [] : Array.from(Array(numNulls)).fill(null)),
  ]
  //iterate comapre next val to current
  let count = 0

  while (count <= NUM_ROWS) {
    count++
    for (let i = 0; i < arr.length; i++) {
      let cur = arr[i]
      let next = arr?.[i + 1]
      if (cur === next) {
        arr[i] = cur * 2
        //shift
        for (let j = i + 2; j <= arr.length; j++) {
          arr[j - 1] = arr[j]
        }
      }
    }
  }

  return arr.map(el => (el > 0 ? el : null))
}

function moveLeft(map) {
  let newArr = []
  let arr = mapToArr(map)
  console.log(reduceLeft([3, 3, 3, 3]))
  // for (let row of arr) {
  //   let newRow = reduceLeft(row.map(o => o.val))
  //   newArr.push(newRow)
  // }
  // //change back to map
  // let newMap = new Map()

  // iterateGrid(({ r, c, key }) => {
  //   let val = newArr[r][c]
  //   newMap.set(key, val)
  // })

  return new Map()
}

function moveRight(map) {
  return map
}

export default function App() {
  let [map, setMap] = useState(() => initMap(2))

  useEventListener("keydown", e => {
    switch (e.key.toLowerCase()) {
      case "arrowright":
        return setMap(moveRight)
      case "arrowleft":
        return setMap(moveLeft)
    }
  })

  return (
    <div className="flex items-center flex-col p-4">
      <div className="font-bold text-3xl text-neutral-600 mb-10">
        Let's Play 2048!
      </div>
      <Grid
        renderCell={({ cellKey }) => {
          let num = map.get(cellKey)
          let backgroundColor = num && (colorMap?.[num] ?? "black")
          return (
            <div
              style={{ backgroundColor }}
              className="w-full h-full flex items-center justify-center rounded-lg"
            >
              <div className="text-6xl text-[#6b635b] font-bold">{num}</div>
            </div>
          )
        }}
        numCols={NUM_COLS}
        numRows={NUM_ROWS}
      />
    </div>
  )
}
