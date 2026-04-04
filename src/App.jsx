import { useReducer } from 'react'
import { useAnimationFrame } from './hooks/useAnimationFrame.js'
import { gameReducer, INITIAL_STATE } from './reducers/game.js'
import ActionBar from './components/ActionBar'
import CastBar from './components/CastBar'
import CombatLog from './components/CombatLog'
import ControlPanel from './components/ControlPanel'
import ErrorText from './components/ErrorText'
import PartyFrames from './components/PartyFrames'

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
      <div className='layout__controlpanel'>
        <ControlPanel infiniteMana={state.infiniteMana} dispatch={dispatch} />
      </div>
      <ErrorText castHistory={state.castHistory} />
      <div className='layout__actionbar'>
        <ActionBar state={state} dispatch={dispatch} />
      </div>
      <div className='layout__castbar'>
        {state.castBar !== null ? <CastBar state={state} /> : ''}
      </div>
      <div className='layout__combatlog'>
        <CombatLog castHistory={state.castHistory} targets={state.targets} />
      </div>
      <div className='layout__buffs'>
        <Buffs />
      </div>
      <div className='layout__partyframes'>
        <PartyFrames state={state} dispatch={dispatch} />
      </div>
      <div className='layout__lifebloomtracker'>
        <LifebloomTracker />
      </div>
    </>
  )
}

function Buffs() {
  return <></>
}

function LifebloomTracker() {
  return <></>
}

export default App
