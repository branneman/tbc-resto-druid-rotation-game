import { useState, useEffect } from 'react'

export function useGameTime() {
  const [t, setT] = useState(() => performance.now())

  useEffect(() => {
    let id
    const tick = (ts) => {
      setT(ts)
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [])

  return t
}
