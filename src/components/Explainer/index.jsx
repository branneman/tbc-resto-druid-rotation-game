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
  const [activeTab, setActiveTab] = useState('4gcd')

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

        <div className='Explainer__tabs'>
          <button
            className={`Explainer__tab${activeTab === '4gcd' ? ' Explainer__tab--active' : ''}`}
            onClick={() => setActiveTab('4gcd')}
          >
            4GCD Cycle
          </button>
          <button
            className={`Explainer__tab${activeTab === '5gcd' ? ' Explainer__tab--active' : ''}`}
            onClick={() => setActiveTab('5gcd')}
          >
            5GCD Cycle
          </button>
        </div>

        {activeTab === '4gcd' && (
          <>
            <section className='Explainer__section'>
              <p className='Explainer__text'>
                The cornerstone of TBC Resto Druid play is the{' '}
                <strong>4GCD Cycle</strong>: a repeating sequence of 4 spells
                that fits within Lifebloom&apos;s 7-second window. Before
                Lifebloom expires you must refresh it to keep the 3-stack,
                everything else slots around that constraint.
              </p>
              <p className='Explainer__text'>
                <img src={`${ICON_PATH}instantcast.jpg`} />
                Instant-cast spells{' '}
                <span className='Explainer__text--muted'>
                  (
                  <img src={`${ICON_PATH}rejuvenation.jpg`} />
                  Rejuvenation, <img src={`${ICON_PATH}swiftmend.jpg`} />
                  Swiftmend, <img src={`${ICON_PATH}natures_swiftness.jpg`} />
                  Nature&apos;s Swiftness +{' '}
                  <img src={`${ICON_PATH}regrowth.jpg`} />
                  Regrowth,{' '}
                  <img src={`${ICON_PATH}spell_nature_faeriefire.jpg`} />
                  Faerie Fire, etc.)
                </span>{' '}
                each take 1.5s. Regrowth takes 2s. How many Lifeblooms you
                maintain determines how many GCDs remain for other healing. The
                ⚠️ patterns require perfect spell-queuing, one late cast lets
                Lifebloom bloom and you lose your stack.
              </p>
              <RotationChart />
            </section>
          </>
        )}

        {activeTab === '5gcd' && (
          <>
            <section className='Explainer__section'>
              <p className='Explainer__text'>
                At <strong>118+ haste rating</strong> the GCD drops to ~1396ms,
                and 5 × 1396ms = 6980ms — just inside Lifebloom&apos;s 7-second
                window. This unlocks the <strong>5GCD cycle</strong>, the
                minimum haste worth having. Below 118 you are locked to 4GCD
                regardless of haste.
              </p>
            </section>

            <section className='Explainer__section'>
              <h2 className='Explainer__sectionTitle'>The Tick Gap</h2>
              <p className='Explainer__text'>
                Haste does <strong>not</strong> speed up HoT ticks in TBC. But
                once haste shortens your rotation below ~7 seconds, your rolling{' '}
                <img src={`${ICON_PATH}lifebloom.jpg`} />
                Lifebloom will occasionally fire a <strong>
                  7th tick
                </strong>{' '}
                before you refresh. When this happens the tick timer resets on
                the next cast — the first tick of the new stack arrives 1 second
                later, not immediately, creating a gap of up to 1 second.
              </p>
              <p className='Explainer__text'>
                The closer you are to the 5GCD breakpoint, the more often this
                gap appears. Near the minimum (113 rating, 6.998s rotation) it
                occurs every other cycle:{' '}
                <strong>~92.9% Lifebloom tick efficiency</strong>.
              </p>
            </section>

            <section className='Explainer__section'>
              <h2 className='Explainer__sectionTitle'>Sweet Spot: 118–247</h2>
              <p className='Explainer__text'>
                Every point of haste above 118 shortens the rotation further and
                closes the tick gap. The heal-equivalent value is approximately:
              </p>
              <p className='Explainer__text'>
                <strong>1 haste rating ≈ 0.22 + 0.00055 × H healing</strong>{' '}
                <span className='Explainer__text--muted'>
                  (H = your +healing; at 2 500 +healing: ≈ 1.6 per point)
                </span>
              </p>
              <p className='Explainer__text'>
                At <strong>247 haste</strong> (6.502s rotation) the gap shrinks
                to near-zero — <strong>~99.97% tick efficiency</strong>. This is
                the first soft cap. Optimal gearing means maximising +Healing
                while targeting exactly 247 haste rating.
              </p>
            </section>

            <section className='Explainer__section'>
              <h2 className='Explainer__sectionTitle'>Going Over 247</h2>
              <p className='Explainer__text'>
                Above 247 the cycle crosses another tick-reset boundary and
                efficiency drops again (~97.5% at 248+). Recovery points follow
                the same pattern:
              </p>
              <p className='Explainer__text'>
                <strong>~295 haste</strong> — gap closes again (~99.97%)
                <br />
                <strong>~320 haste</strong> — next recovery; deviation becomes
                minimal beyond this point
              </p>
              <p className='Explainer__text'>
                The heal-equivalent value of haste stays similar between soft
                caps (~1.57 per point at 2 500 +healing between 247 and 295).
              </p>
              <p className='Explainer__text Explainer__text--muted'>
                Rule of thumb: cap at 247, overshoot to 295, then 320.
              </p>
            </section>
          </>
        )}

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
