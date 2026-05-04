import { useReducer, useState } from 'react'
import { useAnimationFrame } from './hooks/useAnimationFrame.js'
import { gameReducer, INITIAL_STATE } from './reducers/game.js'
import ActionBar from './components/ActionBar'
import CastBar from './components/CastBar'
import CombatLog from './components/CombatLog'
import ControlPanel from './components/ControlPanel'
import ErrorText from './components/ErrorText'
import HealingMeter from './components/HealingMeter'
import LifebloomTracker from './components/LifebloomTracker'
import Buffs from './components/Buffs'
import PartyFrames from './components/PartyFrames'
import Explainer from './components/Explainer'

function App() {
  const [showExplainer, setShowExplainer] = useState(true)
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
        <ControlPanel
          infiniteMana={state.infiniteMana}
          spirit={state.spirit}
          healingpower={state.healingpower}
          talents={state.talents}
          dispatch={dispatch}
        />
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
        <LifebloomTracker
          activeEffects={state.activeEffects}
          gameTime={state.gameTime}
          targets={state.targets}
        />
      </div>
      <div className='layout__healingmeter'>
        <HealingMeter
          castHistory={state.castHistory}
          gameTime={state.gameTime}
          sessionStartAt={state.sessionStartAt}
        />
      </div>
      {/* <div style={{ position: 'absolute', overflow: 'scroll' }}>
        <pre>{JSON.stringify(state.castHistory, null, 2)}</pre>
      </div> */}
      {showExplainer && <Explainer onClose={() => setShowExplainer(false)} />}
    </>
  )
}

export default App
