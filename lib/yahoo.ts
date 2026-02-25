/* eslint-disable @typescript-eslint/no-explicit-any */
import yahooFinance from 'yahoo-finance2'

export interface Quote {
  symbol: string
  name: string
  price: number
  changePercent1D: number
  changePercent5D: number
  changePercent20D: number
  sparkline: number[]
}

export function formatQuote(raw: any, history: any[]): Quote {
  const price = raw.regularMarketPrice ?? 0
  const changePercent1D = raw.regularMarketChangePercent ?? 0

  const closes = (history ?? []).map((h: any) => h.close).filter((v: any) => typeof v === 'number')

  const changePercent5D = closes.length >= 6
    ? ((closes[closes.length - 1] - closes[closes.length - 6]) / closes[closes.length - 6]) * 100
    : 0
  const changePercent20D = closes.length >= 21
    ? ((closes[closes.length - 1] - closes[closes.length - 21]) / closes[closes.length - 21]) * 100
    : 0
  const sparkline = closes.slice(-7)

  return {
    symbol: raw.symbol ?? '',
    name: raw.shortName ?? raw.longName ?? raw.symbol ?? '',
    price,
    changePercent1D,
    changePercent5D,
    changePercent20D,
    sparkline,
  }
}

export async function fetchQuotes(symbols: string[]): Promise<Quote[]> {
  const results = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const [quote, history] = await Promise.all([
          yahooFinance.quote(symbol),
          yahooFinance.historical(symbol, {
            period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            interval: '1d',
          }),
        ])
        return formatQuote(quote, history)
      } catch (err) {
        console.error(`Failed to fetch ${symbol}:`, err)
        return {
          symbol,
          name: symbol,
          price: 0,
          changePercent1D: 0,
          changePercent5D: 0,
          changePercent20D: 0,
          sparkline: [],
        }
      }
    })
  )
  return results
}
