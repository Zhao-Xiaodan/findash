'use client'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

interface Quote {
  symbol: string
  name: string
  price: number
  changePercent1D: number
}

function VolCard({ symbol, label, color, description }: { symbol: string; label: string; color: string; description: string }) {
  const { data } = useQuery<Quote[]>({
    queryKey: ['watchlist'],
    queryFn: () => fetch('/api/watchlist').then(r => r.json()),
    staleTime: 1000 * 60 * 5,
  })
  const quote = data?.find(q => q.symbol === symbol)
  const isUp = (quote?.changePercent1D ?? 0) >= 0

  return (
    <div className="rounded-xl border border-gray-800 bg-[#13131a] p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">{label}</h3>
          <p className="text-[10px] text-gray-700 mt-0.5">{description}</p>
        </div>
        <div className="w-3 h-3 rounded-full mt-1" style={{ backgroundColor: color }} />
      </div>
      <div className="text-3xl font-bold tabular-nums" style={{ color }}>
        {quote ? quote.price.toFixed(2) : '—'}
      </div>
      {quote && (
        <div className={cn('text-sm mt-2', isUp ? 'text-green-500' : 'text-red-500')}>
          {isUp ? '+' : ''}{quote.changePercent1D.toFixed(2)}% today
        </div>
      )}
      {!quote && (
        <div className="text-sm text-gray-700 mt-2">Loading…</div>
      )}
    </div>
  )
}

export function VolatilitySection() {
  return (
    <section className="mb-6">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Volatility</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <VolCard
          symbol="^VIX"
          label="VIX"
          color="#f59e0b"
          description="Equity volatility (CBOE)"
        />
        <VolCard
          symbol="^MOVE"
          label="MOVE Index"
          color="#8b5cf6"
          description="Bond market volatility (ICE BofA)"
        />
      </div>
    </section>
  )
}
