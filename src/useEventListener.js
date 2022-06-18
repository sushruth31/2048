import { useEffect, useRef } from "react"

export default function useEventListener(type, f, deps = []) {
  let fRef = useRef(f)

  useEffect(() => {
    fRef.current = f
  })

  useEffect(() => {
    let handler = e => fRef.current(e)
    window.addEventListener(type, handler)
    return () => window.removeEventListener(type, handler)
  }, [type, ...deps])
}
