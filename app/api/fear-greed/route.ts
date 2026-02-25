export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createCache } from '@/lib/cache'

const cache = createCache<{ score: number; rating: string }>(1000 * 60 * 60)

export async function GET() {
  try {
    const cached = cache.get('fear-greed')
    if (cached) return NextResponse.json(cached)

    const res = await fetch('https://production.dataviz.cnn.io/index/fearandgreed/graphdata', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    const json = await res.json()
    const score = Math.round(json.fear_and_greed?.score ?? 50)
    const rating = (json.fear_and_greed?.rating ?? 'neutral') as string

    const result = { score, rating }
    cache.set('fear-greed', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Fear & Greed error:', error)
    return NextResponse.json({ score: 50, rating: 'neutral' })
  }
}
