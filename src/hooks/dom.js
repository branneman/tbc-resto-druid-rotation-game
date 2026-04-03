import { useState, useEffect } from 'react'

export function useKeySequenceDetector(keySequence, onSequenceDetected) {
  const [typedKeys, setTypedKeys] = useState('')

  useEffect(() => {
    const handleKeyDown = (e) => {
      const newTypedKeys = typedKeys + e.key

      if (newTypedKeys === keySequence) {
        onSequenceDetected()
        setTypedKeys('')
      } else if (!keySequence.startsWith(newTypedKeys)) {
        setTypedKeys('')
      } else {
        setTypedKeys(newTypedKeys)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [typedKeys, keySequence, onSequenceDetected])
}
