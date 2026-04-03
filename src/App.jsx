import { useReducer } from 'react'
import { useAnimationFrame } from './hooks/useAnimationFrame.js'
import { gameReducer, INITIAL_STATE } from './reducers/game.js'
import ActionBar from './components/ActionBar'
import CastBar from './components/CastBar'
import CombatLog from './components/CombatLog'
import FloatingCombatText from './components/FloatingCombatText'

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
      <div className='layout__actionbar'>
        <ActionBar state={state} dispatch={dispatch} />
      </div>
      <div className='layout__castbar'>
        {state.castBar !== null ? <CastBar state={state} /> : ''}
      </div>
      <div className='layout__combatlog'>
        <CombatLog castHistory={state.castHistory} />
      </div>
      <div className='layout__hottracker'>
        <HoTTracker />
      </div>
      <div className='layout__target' style={{ top: '35%', left: '45%' }}>
        <FloatingCombatText castHistory={state.castHistory} />
      </div>
      {/* <pre style={{ fontFamily: 'monospace' }}>
        {JSON.stringify(state, null, 2)}
      </pre> */}
    </>
  )
}

// maps over activeEffects, shows remaining duration via `(appliedAt + duration) - now`
function HoTTracker() {
  return <></>
}

export default App
