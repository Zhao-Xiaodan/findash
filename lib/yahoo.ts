/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Quote {
  symbol: string
  name: string
  price: number
  changePercent1D: number
  changePercent5D: number
  changePercent20D: number
  sparkline: number[]
}

export function formatQuote(raw: any, closes: number[]): Quote {
  const price = raw.regularMarketPrice ?? 0
  const changePercent1D = raw.regularMarketChangePercent ?? 0

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

async function fetchSymbol(symbol: string): Promise<Quote> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1mo&includePrePost=false`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
    },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`Yahoo HTTP ${res.status} for ${symbol}`)
  const json = await res.json()
  const result = json.chart?.result?.[0]
  if (!result) throw new Error(`No chart result for ${symbol}`)

  const meta = result.meta
  const closes: number[] = (result.indicators?.quote?.[0]?.close ?? []).filter((v: any) => v != null)

  return formatQuote({
    symbol: meta.symbol ?? symbol,
    shortName: meta.shortName ?? meta.longName ?? symbol,
    regularMarketPrice: meta.regularMarketPrice ?? meta.chartPreviousClose ?? 0,
    regularMarketChangePercent: meta.regularMarketChangePercent ?? 0,
  }, closes)
}

export async function fetchQuotes(symbols: string[]): Promise<Quote[]> {
  return Promise.all(
    symbols.map(async (symbol) => {
      try {
        return await fetchSymbol(symbol)
      } catch (err) {
        console.error(`Failed to fetch ${symbol}:`, err)
        return { symbol, name: symbol, price: 0, changePercent1D: 0, changePercent5D: 0, changePercent20D: 0, sparkline: [] }
      }
    })
  )
}
