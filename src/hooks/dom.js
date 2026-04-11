import { useState, useEffect } from 'react'

export function useKeySequenceDetector(keySequence, onSequenceDetected) {
  const [typedKeys, setTypedKeys] = useState('')

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.closest('input, textarea, select')) return
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
