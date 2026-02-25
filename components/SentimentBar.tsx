'use client'

interface Props {
  bullish: number
  neutral: number
  bearish: number
  spread: number
  updatedNote: string
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-14">{label}</span>
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs tabular-nums w-8 text-right" style={{ color }}>{value}%</span>
    </div>
  )
}

export function SentimentBar({ bullish, neutral, bearish, spread, updatedNote }: Props) {
  const spreadLabel = spread >= 0 ? `+${spread}` : `${spread}`
  const spreadColor = spread > 10 ? '#22c55e' : spread < -10 ? '#ef4444' : '#f59e0b'

  return (
    <div className="flex flex-col gap-3">
      <Bar label="Bulls" value={bullish} color="#22c55e" />
      <Bar label="Neutral" value={neutral} color="#f59e0b" />
      <Bar label="Bears" value={bearish} color="#ef4444" />
      <div className="flex justify-between items-center pt-2 border-t border-gray-800">
        <span className="text-xs text-gray-500">Spread (Bull - Bear)</span>
        <span className="text-sm font-semibold tabular-nums" style={{ color: spreadColor }}>
          {spreadLabel}
        </span>
      </div>
      <div className="text-[10px] text-gray-600">{updatedNote}</div>
    </div>
  )
}
