import { formatHealing } from './util'
import './HealingMeterChart.css'

const HPS_WINDOW_MS = 10_000
const NUM_BUCKETS = 12 // 2 minutes of 10sec buckets

const VB_W = 300
const VB_H = 100
const PAD_LEFT = 30
const PAD_RIGHT = 30
const PAD_TOP = 4
const PAD_BOTTOM = 4
const CHART_X = PAD_LEFT
const CHART_Y = PAD_TOP
const CHART_W = VB_W - PAD_LEFT - PAD_RIGHT
const CHART_H = VB_H - PAD_TOP - PAD_BOTTOM

// Returns 5 evenly-spaced round labels from 0 to a nice ceiling above max
function yAxisLabels(max, count = 5) {
  const magnitude = Math.pow(10, Math.floor(Math.log10(Math.max(max, 1))))
  const normalized = max / magnitude
  const niceTop =
    (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) *
    magnitude
  const step = niceTop / (count - 1)
  return Array.from({ length: count }, (_, i) => i * step)
}

function buildBuckets(healingEvents, gameTime, sessionStartAt) {
  const currentSlot =
    sessionStartAt > 0
      ? Math.floor((gameTime - sessionStartAt) / HPS_WINDOW_MS)
      : 0
  return Array.from({ length: NUM_BUCKETS }, (_, i) => {
    const slotIndex = currentSlot - (NUM_BUCKETS - 1) + i
    const bucketStart = sessionStartAt + slotIndex * HPS_WINDOW_MS
    const bucketEnd =
      slotIndex === currentSlot ? gameTime : bucketStart + HPS_WINDOW_MS
    const duration = bucketEnd - bucketStart
    if (duration <= 0) return 0
    const healing = healingEvents
      .filter((e) => e.timestamp >= bucketStart && e.timestamp < bucketEnd)
      .reduce((sum, e) => sum + e.amount, 0)
    return healing / (duration / 1000)
  })
}

export default function HealingMeterChart({
  healingEvents,
  gameTime,
  sessionStartAt,
}) {
  const buckets = buildBuckets(healingEvents, gameTime, sessionStartAt)
  const maxBucketHps = Math.max(...buckets, 1)
  const axisLabels = yAxisLabels(maxBucketHps)
  const axisMax = axisLabels[axisLabels.length - 1]

  const toX = (i) => CHART_X + (i / (NUM_BUCKETS - 1)) * CHART_W
  const toY = (v) => CHART_Y + CHART_H - (v / axisMax) * CHART_H

  const points = buckets.map((v, i) => [toX(i), toY(v)])
  const lineD = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`)
    .join(' ')
  const areaD = `${lineD} L${toX(NUM_BUCKETS - 1)},${CHART_Y + CHART_H} L${CHART_X},${CHART_Y + CHART_H} Z`

  return (
    <svg
      className='HealingMeterChart'
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio='none'
    >
      {axisLabels.map((v) => {
        const y = toY(v)
        return (
          <g key={v}>
            <line
              className='HealingMeterChart__gridline'
              x1={CHART_X}
              y1={y}
              x2={CHART_X + CHART_W}
              y2={y}
            />
            <text
              className='HealingMeterChart__label'
              x={CHART_X - 2}
              y={y}
              textAnchor='end'
              dominantBaseline='middle'
            >
              {formatHealing(v)}
            </text>
            <text
              className='HealingMeterChart__label'
              x={CHART_X + CHART_W + 2}
              y={y}
              textAnchor='start'
              dominantBaseline='middle'
            >
              {formatHealing(v)}
            </text>
          </g>
        )
      })}
      <path className='HealingMeterChart__area' d={areaD} />
      <path className='HealingMeterChart__line' d={lineD} />
    </svg>
  )
}
