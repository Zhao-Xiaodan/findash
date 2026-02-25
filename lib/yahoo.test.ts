/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatQuote } from './yahoo'

describe('formatQuote', () => {
  it('formats a quote with correct fields', () => {
    const raw = {
      symbol: 'SPY',
      shortName: 'SPDR S&P 500',
      regularMarketPrice: 598.24,
      regularMarketChangePercent: 0.82,
    }
    const result = formatQuote(raw as any, [])
    expect(result.symbol).toBe('SPY')
    expect(result.price).toBe(598.24)
    expect(result.changePercent1D).toBeCloseTo(0.82)
    expect(result.changePercent5D).toBe(0)
    expect(result.changePercent20D).toBe(0)
    expect(result.sparkline).toHaveLength(0)
  })

  it('calculates 5D and 20D from history', () => {
    const raw = { symbol: 'SPY', regularMarketPrice: 100, regularMarketChangePercent: 1 }
    // Build 21 days of history: starts at 80, ends at 100
    const closes = Array.from({ length: 21 }, (_, i) => 80 + i)
    const result = formatQuote(raw as any, closes)
    // 5D: (100 - 95) / 95 * 100
    expect(result.changePercent5D).toBeCloseTo(5.26, 1)
    // 20D: (100 - 80) / 80 * 100
    expect(result.changePercent20D).toBeCloseTo(25, 0)
  })
})
