import { useState } from 'react'
import './index.css'

export default function ErrorText({ castHistory }) {
  const [dismissed, setDismissed] = useState(() => new Set())

  const errors = castHistory
    .map((entry, id) => ({ ...entry, id }))
    .filter((e) => e.type === 'OUT_OF_MANA' && !dismissed.has(e.id))

  const latest = errors[errors.length - 1]
  if (!latest) return null

  return (
    <div
      key={latest.id}
      className='ErrorText'
      onAnimationEnd={() =>
        setDismissed((prev) => new Set([...prev, latest.id]))
      }
    >
      Not enough mana.
    </div>
  )
}
