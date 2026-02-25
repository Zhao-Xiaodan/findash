import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { createCache } from '@/lib/cache'

const cache = createCache<{ bullish: number; neutral: number; bearish: number; spread: number; updatedNote: string }>(
  1000 * 60 * 60 * 24
)

export async function GET() {
  try {
    const cached = cache.get('aaii')
    if (cached) return NextResponse.json(cached)

    const res = await fetch('https://www.aaii.com/sentimentsurvey/sent_results', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    })
    const html = await res.text()
    const $ = cheerio.load(html)

    const values: number[] = []
    $('table td').each((_, el) => {
      const text = $(el).text().trim().replace('%', '').replace(',', '')
      const num = parseFloat(text)
      if (!isNaN(num) && num > 0 && num <= 100) values.push(num)
    })

    // AAII table typically lists bullish first, then neutral, then bearish
    let bullish = values[0] ?? 37
    let neutral = values[1] ?? 31
    let bearish = values[2] ?? 32

    // Normalize
    const total = bullish + neutral + bearish
    if (total > 0 && Math.abs(total - 100) > 5) {
      bullish = Math.round((bullish / total) * 100)
      neutral = Math.round((neutral / total) * 100)
      bearish = 100 - bullish - neutral
    }

    const result = {
      bullish: Math.round(bullish),
      neutral: Math.round(neutral),
      bearish: Math.round(bearish),
      spread: Math.round(bullish - bearish),
      updatedNote: 'Weekly (Thu)',
    }
    cache.set('aaii', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('AAII error:', error)
    return NextResponse.json({
      bullish: 37,
      neutral: 31,
      bearish: 32,
      spread: 5,
      updatedNote: 'Data unavailable',
    })
  }
}
