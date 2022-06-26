import { useEffect, useRef } from "react"

/**
 * Binds a window listener once per event type. The handler is kept in a ref so
 * a new closure on every render does not detach and reattach the listener.
 */
export default function useEventListener(type, handler) {
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    const listener = event => handlerRef.current(event)
    window.addEventListener(type, listener)
    return () => window.removeEventListener(type, listener)
  }, [type])
}
