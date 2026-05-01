import { useCallback, useEffect, useRef, useState } from 'react'
import './index.css'

const ICON_PATH = '/tbc-resto-druid-rotation-game/icons/'
const CAST_DURATION = { lifebloom: 1.5, regrowth: 2, instantcast: 1.5 }
const SPELL_LABEL = {
  lifebloom: 'Lifebloom',
  regrowth: 'Regrowth',
  instantcast: 'Instant Cast',
}
const SPELL_COLOR = {
  lifebloom: '#1a5c2a',
  regrowth: '#4a8c3f',
  instantcast: '#8b3a3a',
}
const MAX_TIME = 7

const ROTATIONS = [
  {
    tanks: 1,
    gcds: ['lifebloom', 'instantcast', 'instantcast', 'instantcast'],
    time: 6,
  },
  {
    tanks: 1,
    gcds: ['lifebloom', 'regrowth', 'instantcast', 'instantcast'],
    time: 6.5,
  },
  {
    tanks: 1,
    gcds: ['lifebloom', 'regrowth', 'regrowth', 'instantcast'],
    time: 7,
    risky: true,
  },
  {
    tanks: 2,
    gcds: ['lifebloom', 'lifebloom', 'instantcast', 'instantcast'],
    time: 6,
  },
  {
    tanks: 2,
    gcds: ['lifebloom', 'lifebloom', 'regrowth', 'instantcast'],
    time: 6.5,
  },
  {
    tanks: 2,
    gcds: ['lifebloom', 'lifebloom', 'regrowth', 'regrowth'],
    time: 7,
    risky: true,
  },
  {
    tanks: 3,
    gcds: ['lifebloom', 'lifebloom', 'lifebloom', 'instantcast'],
    time: 6,
  },
  {
    tanks: 3,
    gcds: ['lifebloom', 'lifebloom', 'lifebloom', 'regrowth'],
    time: 6.5,
  },
]

export default function Explainer({ onClose }) {
  const windowRef = useRef(null)
  const [atBottom, setAtBottom] = useState(false)

  const checkScroll = useCallback(() => {
    const el = windowRef.current
    if (!el) return
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 4)
  }, [])

  useEffect(() => {
    checkScroll()
  }, [checkScroll])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className='Explainer'>
      <div className='Explainer__backdrop' />
      <div className='Explainer__window' ref={windowRef} onScroll={checkScroll}>
        <h1 className='Explainer__title'>WoW TBC Resto Druid Rotation Game</h1>

        <section className='Explainer__section'>
          <h2 className='Explainer__sectionTitle'>What is this?</h2>
          <p className='Explainer__text'>
            This is a browser-based trainer for Restoration Druid healers in The
            Burning Crusade. As a Resto Druid, your healing output depends not
            just on gear, it depends on how precisely you sequence your spells,
            in real time, under raid pressure.
          </p>
          <p className='Explainer__text'>
            The core challenge: keep a 3-stack Lifebloom active on one or more
            tanks at all times, while filling every remaining GCD with other
            heals. This tool lets you build that muscle memory in a low-stakes
            environment, so your fingers know the rotation before the raid
            depends on it.
          </p>
        </section>

        <section className='Explainer__section'>
          <h2 className='Explainer__sectionTitle'>Optimal Rotation</h2>
          <p className='Explainer__text'>
            The cornerstone of TBC Resto Druid play is the{' '}
            <strong>4GCD Cycle</strong>: a repeating sequence of 4 spells that
            fits within Lifebloom&apos;s 7-second window. Before Lifebloom
            expires you must refresh it to keep the 3-stack, everything else
            slots around that constraint.
          </p>
          <p className='Explainer__text'>
            <img src={`${ICON_PATH}instantcast.jpg`} />
            Instant-cast spells{' '}
            <span className='Explainer__text--muted'>
              (
              <img src={`${ICON_PATH}rejuvenation.jpg`} />
              Rejuvenation, <img src={`${ICON_PATH}swiftmend.jpg`} />
              Swiftmend, <img src={`${ICON_PATH}natures_swiftness.jpg`} />
              Nature's Swiftness + Regrowth, etc.)
            </span>{' '}
            each take 1.5s. Regrowth takes 2s. How many Lifeblooms you maintain
            determines how many GCDs remain for other healing. The ⚠️ patterns
            require perfect spell-queuing, one late cast lets Lifebloom bloom
            and you lose your stack.
          </p>
          <RotationChart />
        </section>

        <div className='Explainer__footer'>
          <button className='Explainer__start' onClick={onClose}>
            Start
          </button>
        </div>
      </div>
      <div
        className={`Explainer__scrollHint${atBottom ? ' Explainer__scrollHint--hidden' : ''}`}
        aria-hidden='true'
      />
    </div>
  )
}

function RotationChart() {
  return (
    <div className='RotationChart'>
      {[1, 2, 3].map((tanks) => (
        <div key={tanks} className='RotationChart__group'>
          <div className='RotationChart__groupLabel'>
            {tanks} {tanks === 1 ? 'Tank' : 'Tanks'}:
          </div>
          {ROTATIONS.filter((r) => r.tanks === tanks).map((row, i) => (
            <RotationRow key={i} row={row} />
          ))}
        </div>
      ))}
      <RotationAxis />
    </div>
  )
}

function RotationRow({ row }) {
  const remainderPct =
    Math.round(((MAX_TIME - row.time) / MAX_TIME) * 10000) / 100

  return (
    <div className='RotationChart__row'>
      <div className='RotationChart__segments'>
        {row.gcds.map((spellId, i) => {
          const widthPct =
            Math.round((CAST_DURATION[spellId] / MAX_TIME) * 10000) / 100
          return (
            <div
              key={i}
              className='RotationChart__segment'
              style={{
                width: `${widthPct}%`,
                backgroundColor: SPELL_COLOR[spellId],
              }}
            >
              <img
                className='RotationChart__segmentIcon'
                src={`/tbc-resto-druid-rotation-game/icons/${spellId}.jpg`}
                alt={SPELL_LABEL[spellId]}
              />
              <span className='RotationChart__segmentLabel'>
                {SPELL_LABEL[spellId]}
              </span>
            </div>
          )
        })}
        {remainderPct > 0 && (
          <div
            className='RotationChart__remainder'
            style={{ width: `${remainderPct}%` }}
          />
        )}
      </div>
      <div className='RotationChart__rowMeta'>
        <span className='RotationChart__time'>{row.time}s</span>
        {row.risky && (
          <span
            className='RotationChart__risky'
            title='Not recommended — requires perfect spell-queuing with no room for error'
          >
            ⚠️
          </span>
        )}
      </div>
    </div>
  )
}

function RotationAxis() {
  const ticks = Array.from({ length: MAX_TIME + 1 }, (_, i) => i)
  return (
    <div className='RotationChart__axisWrapper'>
      <div className='RotationChart__axis'>
        {ticks.map((t) => (
          <div
            key={t}
            className={`RotationChart__tick${t === 0 ? ' RotationChart__tick--first' : t === MAX_TIME ? ' RotationChart__tick--last' : ''}`}
            style={{ left: `${Math.round((t / MAX_TIME) * 10000) / 100}%` }}
          >
            <div className='RotationChart__tickMark' />
            <span className='RotationChart__tickLabel'>{t}s</span>
          </div>
        ))}
      </div>
      <div className='RotationChart__axisMetaSpacer' />
    </div>
  )
}
