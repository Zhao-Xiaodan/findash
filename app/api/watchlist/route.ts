export const dynamic = 'force-dynamic'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { fetchQuotes } from '@/lib/yahoo'
import { createCache } from '@/lib/cache'

const SYMBOLS = ['SPY', 'QQQ', '^DJI', 'IWM', '^VIX', 'TLT', 'GLD', 'DX-Y.NYB', 'BTC-USD']

const DISPLAY_NAMES: Record<string, string> = {
  'SPY': 'S&P 500',
  'QQQ': 'Nasdaq 100',
  '^DJI': 'Dow Jones',
  'IWM': 'Russell 2000',
  '^VIX': 'VIX',
  'TLT': '20Y Treasury',
  'GLD': 'Gold',
  'DX-Y.NYB': 'US Dollar',
  'BTC-USD': 'Bitcoin',
}

const cache = createCache<any[]>(1000 * 60 * 5) // 5 min TTL

export async function GET() {
  try {
    const cached = cache.get('watchlist')
    if (cached) return NextResponse.json(cached)

    const quotes = await fetchQuotes(SYMBOLS)
    const result = quotes.map(q => ({
      ...q,
      name: DISPLAY_NAMES[q.symbol] ?? q.name,
    }))

    cache.set('watchlist', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Watchlist error:', error)
    return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 })
  }
}
