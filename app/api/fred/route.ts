import { NextRequest, NextResponse } from 'next/server'
import { buildFredUrl, parseObservations } from '@/lib/fred'
import { createCache } from '@/lib/cache'

/* eslint-disable @typescript-eslint/no-explicit-any */
const cache = createCache<any>(1000 * 60 * 60 * 24)

const SERIES: Record<string, { label: string; unit: string }> = {
  'BAMLH0A0HYM2':           { label: 'HY Credit Spread', unit: '%' },
  'BAMLC0A0CM':             { label: 'IG Credit Spread', unit: '%' },
  'PERMIT':                  { label: 'Housing Permits', unit: 'K' },
  'CORESTICKM159SFRBATL':   { label: 'Sticky CPI', unit: '%' },
  'CAPE':                    { label: 'Shiller CAPE', unit: 'x' },
}

export async function GET(req: NextRequest) {
  const seriesId = req.nextUrl.searchParams.get('series') ?? 'BAMLH0A0HYM2'
  const apiKey = process.env.FRED_API_KEY ?? ''

  if (!apiKey || apiKey === 'your_key_here') {
    return NextResponse.json({ error: 'FRED_API_KEY not configured' }, { status: 503 })
  }

  try {
    const cached = cache.get(seriesId)
    if (cached) return NextResponse.json(cached)

    const url = buildFredUrl(seriesId, apiKey, 120)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`FRED API error: ${res.status}`)
    const json = await res.json()
    const data = parseObservations(json)
    const meta = SERIES[seriesId] ?? { label: seriesId, unit: '' }

    const result = { seriesId, ...meta, data }
    cache.set(seriesId, result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('FRED error:', error)
    return NextResponse.json({ error: 'FRED fetch failed' }, { status: 500 })
  }
}
