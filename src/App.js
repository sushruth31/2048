import { useEffect, useReducer, useRef, useState, Fragment } from "react"
import Grid from "./grid"
import useEventListener from "./useEventListener"
import { AnimatePresence, motion } from "framer-motion"

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

function fill(n, val = null) {
  return !n ? [] : Array.from(Array(n)).fill(val)
}

function cleanWNulls(arr) {
  return arr.map(el => (Number(el) > 0 ? el : null))
}

function reduceLeft(arr) {
  //fitler nulls and move to right
  let filteredArr = arr.filter(el => el != null)
  let numNulls = arr.length - filteredArr.length
  arr = [...filteredArr, ...fill(numNulls)]
  //iterate comapre next val to current
  let count = 0

  while (count <= NUM_ROWS) {
    count++
    for (let i = 0; i < arr.length; i++) {
      let cur = arr[i]
      let next = arr?.[i + 1]
      if (cur === next) {
        arr[i] = cur * 2
        //shift left
        for (let j = i + 2; j <= arr.length; j++) {
          arr[j - 1] = arr[j]
        }
      }
    }
  }

  return cleanWNulls(arr)
}

function curriedMap(f, transform) {
  return row => f(transform ? row.map(transform) : row)
}

function mapSize(map) {
  return [...map].filter(([_, v]) => v).length
}

function move(map, reduceFn) {
  //console.log(reduceLeft([3, 3, 3, 3]))
  let newArr = mapToArr(map).map(curriedMap(reduceFn, o => o.val))

  //change back to map
  return arrToMap(newArr)
}

function reduceRight(arr) {
  //filter out null move to left
  let filteredArr = arr.filter(el => el != null),
    count = 0
  let numNulls = arr.length - filteredArr.length
  arr = [...fill(numNulls), ...filteredArr]
  //[null, 3, 3, 2] -> [null, null, 6, 2]
  while (count <= NUM_ROWS) {
    count++
    for (let i = arr.length - 1; i >= 0; i--) {
      let cur = arr[i]
      let prev = arr?.[i - 1]
      if (cur === prev) {
        arr[i] = cur * 2
        //shift left
        for (let j = i - 2; j >= 0; j--) {
          arr[j + 1] = arr[j]
        }
      }
    }
  }
  return cleanWNulls(arr)
}

function coinToss() {
  return Math.random() > 0.5
}

function flipLeft(arr, orig = arr) {
  let newArr = []
  for (let i = orig.length - 1; i >= 0; i--) {
    let count = 0,
      temp = []
    while (count <= orig.length - 1) {
      let el = arr[count][i]
      temp.push(el)
      count++
    }
    newArr.push(temp)
  }
  return newArr
}

function flipRight(newArr, orig = newArr) {
  let final = []
  for (let i = 0; i < orig.length; i++) {
    let count = orig.length - 1,
      temp = []
    while (count >= 0) {
      let el = newArr[count][i]
      count--
      temp.push(el)
    }
    final.push(temp)
  }
  return final
}

function reduceUp(map) {
  let arr = mapToArr(map).map(row => row.map(o => o.val))
  //[0, 3], [1, 3], [2, 3] [0, 2] [1, 2] [2, 2]
  //flip left
  let newArr = flipLeft(arr)
  //reduce left
  newArr = newArr.map(reduceLeft)
  //flip right
  //[3, 0], [2, 0], [1, 0], [3, 1], [2, 1] [1, 1]
  return flipRight(newArr, arr)
}

function arrToMap(arr) {
  let map = new Map()
  iterateGrid(({ r, c, key }) => {
    let val = arr[r][c]
    map.set(key, val)
  })
  return map
}

function reduceDown(map) {
  let arr = mapToArr(map).map(row => row.map(o => o.val))

  // -> [[6, 5, 2], [2, 2, 3], [1, 1, 1]]
  //[3, 0], [2, 0], [1, 0] [3, 1] [2, 1] [1, 1] incerment i second
  //flip right
  let newArr = flipRight(arr)
  //reduce left
  newArr = newArr.map(reduceLeft)
  //flip left
  //[3, 0], [2, 0], [1, 0], [3, 1], [2, 1] [1, 1]
  return flipLeft(newArr, arr)
}

function areMapsEqual(map1, map2) {
  if (map1.size !== map2.size) return false
  for (let [k, v] of map1.entries()) {
    if (v !== map2.get(k)) {
      return false
    }
  }
  return true
}

export default function App() {
  let [map, setMap] = useState(() => initMap(2))
  let [gameOver, setGameOver] = useState(false)
  let prevMap = useRef(new Map(map))

  useEffect(() => {
    //compare two maps
    if (
      areMapsEqual(map, prevMap.current) &&
      mapSize(map) === NUM_COLS * NUM_ROWS
    ) {
      return setGameOver(true)
    }
    prevMap.current = new Map(map)
  }, [map])

  function handleKeyVert(reduceFn) {
    setMap(map => {
      let arr = reduceFn(map)
      let proposedMap = arrToMap(arr)
      if (areMapsEqual(map, proposedMap)) {
        return proposedMap
      }
      let [newKey, newVal] = addNewNumber(proposedMap)
      return proposedMap.set(newKey, newVal)
    })
  }

  function addNewNumber(proposed) {
    //get a new key
    let newKey, newVal
    do {
      //check if this already exists
      newKey = getRandomKey()
    } while (proposed.get(newKey))
    newVal = coinToss() ? 2 : 4
    return [newKey, newVal]
  }

  function handleKey(reduceFn) {
    setMap(map => {
      let proposedMap = move(map, reduceFn)
      if (areMapsEqual(map, proposedMap)) {
        return proposedMap
      }
      let [newKey, newVal] = addNewNumber(proposedMap)
      //add new key  to the temp
      return proposedMap.set(newKey, newVal)
    })
  }

  useEventListener("keydown", e => {
    switch (e.key.toLowerCase()) {
      case "arrowright":
        return handleKey(reduceRight)
      case "arrowleft":
        return handleKey(reduceLeft)
      case "arrowup":
        return handleKeyVert(reduceUp)
      case "arrowdown":
        return handleKeyVert(reduceDown)
    }
  })

  return (
    <div className="flex items-center flex-col p-4">
      <div className="font-bold text-3xl text-neutral-600 mb-10">
        Let's Play 2048!
      </div>
      {gameOver && <div>Game Over</div>}

      <Grid
        renderCell={({ cellKey }) => {
          let num = map.get(cellKey)
          let backgroundColor = num && (colorMap?.[num] ?? "black")
          return (
            <>
              <AnimatePresence>
                <motion.div
                  key={cellKey}
                  variants={{
                    hidden: {
                      opacity: 0,
                    },
                    visible: {
                      opacity: 1,
                    },
                  }}
                  animate="visible"
                  initial="hidden"
                  style={{ backgroundColor }}
                  className="w-full h-full flex items-center justify-center rounded-lg"
                >
                  <div className="text-6xl text-[#6b635b] font-bold">{num}</div>
                </motion.div>
              </AnimatePresence>
            </>
          )
        }}
        numCols={NUM_COLS}
        numRows={NUM_ROWS}
      />
    </div>
  )
}
