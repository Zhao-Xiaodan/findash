export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createCache } from '@/lib/cache'

interface Meeting {
  date: string
  cut25: number
  hold: number
  hike25: number
}

const cache = createCache<{ meetings: Meeting[] }>(1000 * 60 * 60)

// Fallback data updated periodically
const FALLBACK: { meetings: Meeting[] } = {
  meetings: [
    { date: 'Mar 19, 2026', cut25: 8, hold: 88, hike25: 4 },
    { date: 'May 7, 2026',  cut25: 31, hold: 62, hike25: 7 },
    { date: 'Jun 18, 2026', cut25: 48, hold: 44, hike25: 8 },
  ],
}

export async function GET() {
  try {
    const cached = cache.get('cme')
    if (cached) return NextResponse.json(cached)

    const res = await fetch(
      'https://www.cmegroup.com/CmeWS/mvc/CountdownToFomc/CountdownToFomc.getCountdownToFomc.html',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          'Accept': 'application/json, text/plain, */*',
        },
      }
    )

    if (!res.ok) throw new Error(`CME error: ${res.status}`)
    const json = await res.json()

    const meetings: Meeting[] = (json.meetings ?? []).slice(0, 3).map((m: Record<string, string>) => ({
      date: m.meetingDate ?? m.date ?? '',
      cut25: Math.round(parseFloat(m.probDown25 ?? m.probCut25 ?? '0')),
      hold: Math.round(parseFloat(m.probUnchanged ?? m.probHold ?? '0')),
      hike25: Math.round(parseFloat(m.probUp25 ?? m.probHike25 ?? '0')),
    }))

    const result = meetings.length > 0 ? { meetings } : FALLBACK
    cache.set('cme', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('CME error:', error)
    return NextResponse.json(FALLBACK)
  }
}
