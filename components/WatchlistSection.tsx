'use client'
import { useQuery } from '@tanstack/react-query'
import { WatchlistCard } from './WatchlistCard'

interface Quote {
  symbol: string
  name: string
  price: number
  changePercent1D: number
  changePercent5D: number
  changePercent20D: number
  sparkline: number[]
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#13131a] p-4 animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-12 mb-2" />
      <div className="h-3 bg-gray-800 rounded w-20 mb-4" />
      <div className="h-6 bg-gray-700 rounded w-24 mb-3" />
      <div className="h-10 bg-gray-800 rounded mb-3" />
      <div className="space-y-2">
        {[1, 2, 3].map(i => <div key={i} className="h-3 bg-gray-800 rounded" />)}
      </div>
    </div>
  )
}

export function WatchlistSection() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => fetch('/api/watchlist').then(r => r.json()),
    refetchInterval: 1000 * 60 * 5,
  })

  return (
    <section className="mb-10">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
        Market Watchlist
      </h2>
      {error && <p className="text-red-400 text-sm mb-2">Failed to load watchlist</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-9 gap-3">
        {isLoading
          ? Array(9).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : (data as Quote[])?.map((quote) => <WatchlistCard key={quote.symbol} quote={quote} />)
        }
      </div>
    </section>
  )
}
