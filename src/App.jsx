import { useReducer } from 'react'
import { useAnimationFrame } from './hooks/useAnimationFrame.js'
import { gameReducer, INITIAL_STATE } from './reducers/game.js'
// import reactLogo from './assets/react.svg'
// import './App.css'

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
      <CastBar />
      <ActionBar dispatch={dispatch} />
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

// buttons that fire PLAYER_CAST
// Reads gcdEndsAt and castBar from state to show disabled states
function ActionBar({ dispatch }) {
  return (
    <div className='ActionBar'>
      <p>ActionBar</p>
      <button
        onClick={() =>
          dispatch({
            type: 'PLAYER_CAST',
            spellId: 'lifebloom',
            timestamp: performance.now(),
          })
        }
      >
        Lifebloom
      </button>
      <button
        onClick={() =>
          dispatch({
            type: 'PLAYER_CAST',
            spellId: 'rejuvenation',
            timestamp: performance.now(),
          })
        }
      >
        Rejuvenation
      </button>
      <button
        onClick={() =>
          dispatch({
            type: 'PLAYER_CAST',
            spellId: 'regrowth',
            timestamp: performance.now(),
          })
        }
      >
        Regrowth
      </button>
      <button
        onClick={() =>
          dispatch({
            type: 'PLAYER_CAST',
            spellId: 'swiftmend',
            timestamp: performance.now(),
          })
        }
      >
        Swiftmend
      </button>
      <button
        onClick={() =>
          dispatch({
            type: 'PLAYER_CAST',
            spellId: 'natures_swiftness',
            timestamp: performance.now(),
          })
        }
      >
        Nature's Swiftness
      </button>
    </div>
  )
}

// maps over activeEffects, shows remaining duration via `(appliedAt + duration) - now`
function HoTTracker() {
  return <></>
}

// reads castHistory
function CombatLog() {
  return <></>
}

export default App
