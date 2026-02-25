'use client'
import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface DataPoint {
  date: string
  value: number
}

interface Props {
  title: string
  data: DataPoint[]
  unit: string
  color?: string
}

const RANGES = [
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: '3Y', months: 36 },
]

export function MacroChart({ title, data, unit, color = '#3b82f6' }: Props) {
  const [rangeMonths, setRangeMonths] = useState(12)

  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - rangeMonths)
  const filtered = data.filter(d => new Date(d.date) >= cutoff)
  const displayed = filtered.length > 0 ? filtered : data

  const latest = displayed[displayed.length - 1]?.value ?? 0

  return (
    <div className="rounded-xl border border-gray-800 bg-[#13131a] p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">{title}</h3>
          <div className="text-2xl font-bold tabular-nums mt-1">
            {latest.toFixed(2)}
            <span className="text-sm text-gray-500 ml-1">{unit}</span>
          </div>
        </div>
        <div className="flex gap-1">
          {RANGES.map(r => (
            <button
              key={r.label}
              onClick={() => setRangeMonths(r.months)}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                rangeMonths === r.months
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayed} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`grad-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: '#6b6b80' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={d => d.slice(0, 7)}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 9, fill: '#6b6b80' }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={{
                background: '#13131a',
                border: '1px solid #1e1e2e',
                borderRadius: 8,
                fontSize: 11,
              }}
              formatter={(v: number | undefined) => [v != null ? `${v.toFixed(2)}${unit}` : '', '']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#grad-${title.replace(/\s+/g, '-')})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
