import { useEffect, useState } from "react"

const STORAGE_KEY = "2048.best-score"

const readBest = () => Number(window.localStorage.getItem(STORAGE_KEY)) || 0

/** Mirrors the running score into localStorage — the only I/O in the app. */
export default function useBestScore(score) {
  const [best, setBest] = useState(readBest)

  useEffect(() => {
    if (score <= best) return
    window.localStorage.setItem(STORAGE_KEY, String(score))
    setBest(score)
  }, [score, best])

  return best
}
