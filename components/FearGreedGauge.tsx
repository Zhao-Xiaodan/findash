'use client'

const COLORS: Record<string, string> = {
  'extreme fear': '#ef4444',
  'fear': '#f97316',
  'neutral': '#f59e0b',
  'greed': '#84cc16',
  'extreme greed': '#22c55e',
}

function getColor(rating: string): string {
  return COLORS[rating.toLowerCase()] ?? '#f59e0b'
}

interface Props {
  score: number
  rating: string
}

export function FearGreedGauge({ score, rating }: Props) {
  const color = getColor(rating)
  // Needle: score 0 = far left (-90°), score 100 = far right (+90°)
  const angleDeg = (score / 100) * 180 - 90
  const rad = (angleDeg * Math.PI) / 180
  const cx = 100
  const cy = 95
  const r = 72
  const needleX = cx + r * Math.cos(rad)
  const needleY = cy + r * Math.sin(rad)

  // Arc: semicircle from left (180°) to right (0°)
  const arcLength = Math.PI * r  // half circumference
  const filledLength = (score / 100) * arcLength

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-52 h-28">
        {/* Background arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#1e1e2e"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Colored filled arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${filledLength} ${arcLength}`}
          opacity="0.85"
        />
        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={needleX} y2={needleY}
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="4" fill="white" />
      </svg>
      <div className="text-4xl font-bold tabular-nums -mt-2" style={{ color }}>
        {score}
      </div>
      <div className="text-sm font-medium capitalize mt-1" style={{ color }}>
        {rating}
      </div>
      <div className="flex justify-between w-52 mt-2 px-1 text-[9px] text-gray-600">
        <span>Panic</span>
        <span>Caution</span>
        <span>Neutral</span>
        <span>Optimism</span>
        <span>Euphoria</span>
      </div>
    </div>
  )
}
