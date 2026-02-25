'use client'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

interface Quote {
  symbol: string
  name: string
  price: number
  changePercent1D: number
  changePercent5D: number
  changePercent20D: number
  sparkline: number[]
}

function TrendRow({ label, value }: { label: string; value: number }) {
  const isPos = value >= 0
  const pct = `${isPos ? '+' : ''}${value.toFixed(2)}%`
  const barWidth = Math.min(Math.abs(value) * 8, 100)

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-7 text-gray-500 shrink-0 font-mono">{label}</span>
      <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', isPos ? 'bg-green-500' : 'bg-red-500')}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <span className={cn('w-14 text-right tabular-nums', isPos ? 'text-green-500' : 'text-red-500')}>
        {pct}
      </span>
    </div>
  )
}

export function WatchlistCard({ quote }: { quote: Quote }) {
  const sparkData = quote.sparkline.map((v) => ({ v }))
  const isUp = quote.changePercent1D >= 0
  const formattedPrice = quote.price >= 1000
    ? quote.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : quote.price.toFixed(2)

  return (
    <div className="rounded-xl border border-gray-800 bg-[#13131a] p-4 flex flex-col gap-3 hover:border-blue-500/40 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-bold text-sm tracking-wide">{quote.symbol.replace('^', '')}</div>
          <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[130px]">{quote.name}</div>
        </div>
        <div className={cn(
          'text-xs font-medium px-1.5 py-0.5 rounded',
          isUp ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
        )}>
          {isUp ? '▲' : '▼'}
        </div>
      </div>

      <div className="tabular-nums font-semibold text-xl">{formattedPrice}</div>

      {sparkData.length > 1 && (
        <div className="h-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={isUp ? '#22c55e' : '#ef4444'}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <TrendRow label="1D" value={quote.changePercent1D} />
        <TrendRow label="5D" value={quote.changePercent5D} />
        <TrendRow label="20D" value={quote.changePercent20D} />
      </div>
    </div>
  )
}
