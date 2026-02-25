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
    ? ((closes[closes.length - 1] - closes[closes.length - 6]) / closes[closes.length - 6]) * 100 : 0
  const changePercent20D = closes.length >= 21
    ? ((closes[closes.length - 1] - closes[closes.length - 21]) / closes[closes.length - 21]) * 100 : 0
  return {
    symbol: raw.symbol ?? '',
    name: raw.shortName ?? raw.longName ?? raw.symbol ?? '',
    price,
    changePercent1D,
    changePercent5D,
    changePercent20D,
    sparkline: closes.slice(-7),
  }
}

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// Module-level auth cache — persists for the lifetime of a serverless instance
let _auth: { crumb: string; cookie: string; exp: number } | null = null

async function getAuth(): Promise<{ crumb: string; cookie: string }> {
  if (_auth && Date.now() < _auth.exp) return _auth

  // Step 1: hit Yahoo Finance to receive consent cookies
  const homeRes = await fetch('https://finance.yahoo.com/', {
    headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml' },
    signal: AbortSignal.timeout(8000),
  })

  // Collect Set-Cookie values (Node 18 undici exposes getSetCookie())
  let cookie = ''
  const raw = (homeRes.headers as any).getSetCookie?.() as string[] | undefined
  if (raw?.length) {
    cookie = raw.map((c: string) => c.split(';')[0]).join('; ')
  } else {
    // Fallback: parse the combined set-cookie string
    const combined = homeRes.headers.get('set-cookie') ?? ''
    cookie = combined.split(/,(?=[A-Za-z_]+=)/).map(c => c.split(';')[0].trim()).join('; ')
  }

  // Step 2: get crumb with those cookies
  const crumbRes = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
    headers: { 'User-Agent': UA, 'Cookie': cookie },
    signal: AbortSignal.timeout(8000),
  })
  const crumb = (await crumbRes.text()).trim()

  if (!crumb || crumb.includes('<') || crumb.includes('{')) {
    throw new Error(`Invalid crumb response: ${crumb.slice(0, 80)}`)
  }

  _auth = { crumb, cookie, exp: Date.now() + 3_600_000 } // 1hr
  return _auth
}

async function fetchSymbol(symbol: string): Promise<Quote> {
  const { crumb, cookie } = await getAuth()
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1mo&crumb=${encodeURIComponent(crumb)}`

  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Cookie': cookie,
      'Referer': 'https://finance.yahoo.com/',
      'Accept': '*/*',
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
  // Fetch auth once, then all symbols in parallel
  try {
    await getAuth()
  } catch (err) {
    console.error('Yahoo auth failed:', err)
  }

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
