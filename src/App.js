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
  //[4, 4, 4, null] -> [8, 4, nil, nil]
  function getNext(i) {
    let nextI = i + 1
    let attempt = arr?.[nextI]
    if (attempt) return { val: attempt, i: nextI }
    if (i >= arr.length) return
    return getNext(++i)
  }

  for (let i = 0; i < arr.length; i++) {
    let cur = arr[i]
    let next = getNext(i)
    let nextVal = next?.val
    let nextI = next?.i
    if (cur === nextVal) {
      arr[i] = cur + nextVal
      //null the next index
      arr[nextI] = null
      //shift left
      for (let j = i + 1; j < arr.length; j++) {
        arr[j] = arr[j + 1]
      }
    }
  }

  let count = 0

  while (count <= NUM_COLS) {
    count++
    for (let i = 1; i < arr.length; i++) {
      let cur = arr[i]
      let prev = arr[i - 1]
      if (!prev) {
        arr[i - 1] = arr[i]
        arr[i] = null
      }
    }
  }

  return arr.map(el => (Number(el) > 0 ? el : null))
}

function moveLeft(map) {
  let newArr = []
  let arr = mapToArr(map)
  for (let row of arr) {
    let newRow = reduceLeft(row.map(o => o.val))
    newArr.push(newRow)
  }
  //change back to map
  let newMap = new Map()

  iterateGrid(({ r, c, key }) => {
    let val = newArr[r][c]
    newMap.set(key, val)
  })

  return newMap
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
