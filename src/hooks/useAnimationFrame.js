import { useRef, useEffect } from 'react'

export const useAnimationFrame = (cb) => {
  const requestRef = useRef()
  const previousTimeRef = useRef()

  const rAF = (timestamp) => {
    if (previousTimeRef.current != undefined) {
      cb({ timestamp })
    }
    previousTimeRef.current = timestamp
    requestRef.current = requestAnimationFrame(rAF)
  }

  useEffect(() => {
    requestRef.current = requestAnimationFrame(rAF)
    return () => cancelAnimationFrame(requestRef.current)
  })
}
