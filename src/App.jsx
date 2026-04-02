import { useReducer } from 'react'
import { useAnimationFrame } from './hooks/useAnimationFrame.js'
import { gameReducer, INITIAL_STATE } from './reducers/game.js'
import ActionBar from './components/ActionBar'
import CombatLog from './components/CombatLog'

function App() {
  const [state, dispatch] = useReducer(
    gameReducer,
    structuredClone(INITIAL_STATE),
  )

  // Drives the game by firing TICK every animation frame (~60fps)
  useAnimationFrame(({ timestamp }) => {
    dispatch({ type: 'TICK', timestamp })
  })

  return (
    <>
      <ActionBar state={state} dispatch={dispatch} />
      <CastBar />
      <HoTTracker />
      <CombatLog castHistory={state.castHistory} />
      <pre style={{ fontFamily: 'monospace' }}>
        {JSON.stringify(state, null, 2)}
      </pre>
    </>
  )
}

// reads castBar from state
// does not render at 0% or 100%
// computes to fill percentage: (now - startedAt) / duration
// uses gameTime from state as the 'current time'
function CastBar() {
  return <></>
}

// maps over activeEffects, shows remaining duration via `(appliedAt + duration) - now`
function HoTTracker() {
  return <></>
}

export default App
