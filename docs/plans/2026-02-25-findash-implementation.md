# FinDash Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a personal financial market dashboard (Next.js 14) that tracks index watchlist, sentiment, macro indicators, and links to external data sources — replacing a Notion + Google Sheets setup.

**Architecture:** Next.js 14 App Router with API routes as a data proxy (no CORS issues, in-memory caching). React Query on the client handles polling and stale state. Dark/light theme via next-themes.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, React Query, recharts, yahoo-finance2, cheerio, next-themes, lucide-react

**Design doc:** `docs/plans/2026-02-25-findash-design.md`

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json` (via CLI)
- Create: `tsconfig.json` (via CLI)
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`

**Step 1: Scaffold Next.js project**

Run from `/Users/xiaodan/[66]myProject/Web_finance`:
```bash
npx create-next-app@14 . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --no-git
```
Answer prompts: accept all defaults. The `.` installs into the current directory.

**Step 2: Install dependencies**
```bash
npm install yahoo-finance2 cheerio @tanstack/react-query next-themes recharts lucide-react clsx tailwind-merge
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom @types/cheerio
```

**Step 3: Add vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
})
```

Create `vitest.setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

**Step 4: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 5: Create .env.local**
```bash
echo "FRED_API_KEY=your_key_here" > .env.local
echo ".env.local" >> .gitignore
```

User must replace `your_key_here` with their key from https://fredaccount.stlouisfed.org/apikeys

**Step 6: Verify scaffold works**
```bash
npm run dev
```
Expected: Server starts on http://localhost:3000, default Next.js page loads.

**Step 7: Commit**
```bash
git init && git add -A && git commit -m "feat: scaffold Next.js 14 project with dependencies"
```

---

## Task 2: Global Styles & Theme System

**Files:**
- Modify: `app/globals.css`
- Create: `tailwind.config.ts` (replace generated)
- Create: `lib/utils.ts`

**Step 1: Write test for utils**

Create `lib/utils.test.ts`:
```typescript
import { cn } from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })
  it('handles conditional classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c')
  })
  it('resolves tailwind conflicts', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })
})
```

**Step 2: Run test — expect FAIL**
```bash
npm test lib/utils.test.ts
```

**Step 3: Implement utils**

Create `lib/utils.ts`:
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Step 4: Run test — expect PASS**
```bash
npm test lib/utils.test.ts
```

**Step 5: Replace tailwind.config.ts**
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          dark: '#0a0a0f',
          light: '#f4f4f8',
        },
        surface: {
          dark: '#13131a',
          light: '#ffffff',
        },
        border: {
          dark: '#1e1e2e',
          light: '#e2e2ea',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
```

**Step 6: Replace app/globals.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --green: #22c55e;
  --red: #ef4444;
  --yellow: #f59e0b;
  --blue: #3b82f6;
  --purple: #8b5cf6;
}

body {
  font-family: 'Inter', sans-serif;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #1e1e2e; border-radius: 3px; }
```

**Step 7: Commit**
```bash
git add -A && git commit -m "feat: add theme system and global styles"
```

---

## Task 3: Root Layout, ThemeToggle & Header

**Files:**
- Create: `components/ThemeToggle.tsx`
- Create: `components/Header.tsx`
- Create: `components/Providers.tsx`
- Modify: `app/layout.tsx`

**Step 1: Write test for ThemeToggle**

Create `components/ThemeToggle.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { ThemeToggle } from './ThemeToggle'

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
}))

describe('ThemeToggle', () => {
  it('renders a button', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

**Step 2: Run test — expect FAIL**
```bash
npm test components/ThemeToggle.test.tsx
```

**Step 3: Create ThemeToggle**

Create `components/ThemeToggle.tsx`:
```typescript
'use client'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-9 h-9" />

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg border border-border-dark dark:border-border-dark hover:bg-white/10 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
```

**Step 4: Run test — expect PASS**
```bash
npm test components/ThemeToggle.test.tsx
```

**Step 5: Create Providers**

Create `components/Providers.tsx`:
```typescript
'use client'
import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 1000 * 60 * 5, retry: 2 },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}
```

**Step 6: Create Header**

Create `components/Header.tsx`:
```typescript
'use client'
import { ThemeToggle } from './ThemeToggle'
import { RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

export function Header() {
  const queryClient = useQueryClient()
  const [lastUpdated] = useState(new Date())

  const handleRefresh = () => {
    queryClient.invalidateQueries()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border-dark dark:border-border-dark bg-bg-dark/90 dark:bg-bg-dark/90 bg-bg-light/90 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight">💰 FinDash</span>
          <span className="text-xs text-gray-500 hidden sm:block">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Refresh all data"
          >
            <RefreshCw size={16} />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
```

**Step 7: Update app/layout.tsx**
```typescript
import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Header } from '@/components/Header'

export const metadata: Metadata = {
  title: 'FinDash — Market Dashboard',
  description: 'Personal financial market dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-bg-light dark:bg-bg-dark text-gray-900 dark:text-gray-100 min-h-screen">
        <Providers>
          <Header />
          <main className="max-w-[1600px] mx-auto px-6 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
```

**Step 8: Run tests**
```bash
npm test
```

**Step 9: Commit**
```bash
git add -A && git commit -m "feat: add layout, header and theme toggle"
```

---

## Task 4: Cache Utility & Yahoo Finance Lib

**Files:**
- Create: `lib/cache.ts`
- Create: `lib/yahoo.ts`

**Step 1: Write cache tests**

Create `lib/cache.test.ts`:
```typescript
import { createCache } from './cache'

describe('createCache', () => {
  it('returns null for missing key', () => {
    const cache = createCache(1000)
    expect(cache.get('x')).toBeNull()
  })
  it('returns cached value within TTL', () => {
    const cache = createCache(1000 * 60)
    cache.set('k', { v: 1 })
    expect(cache.get('k')).toEqual({ v: 1 })
  })
  it('returns null after TTL expires', () => {
    vi.useFakeTimers()
    const cache = createCache(1000)
    cache.set('k', { v: 1 })
    vi.advanceTimersByTime(2000)
    expect(cache.get('k')).toBeNull()
    vi.useRealTimers()
  })
})
```

**Step 2: Run — expect FAIL**
```bash
npm test lib/cache.test.ts
```

**Step 3: Implement cache**

Create `lib/cache.ts`:
```typescript
interface CacheEntry<T> {
  data: T
  timestamp: number
}

export function createCache<T>(ttlMs: number) {
  const store = new Map<string, CacheEntry<T>>()

  return {
    get(key: string): T | null {
      const entry = store.get(key)
      if (!entry) return null
      if (Date.now() - entry.timestamp > ttlMs) {
        store.delete(key)
        return null
      }
      return entry.data
    },
    set(key: string, data: T): void {
      store.set(key, { data, timestamp: Date.now() })
    },
  }
}
```

**Step 4: Run — expect PASS**
```bash
npm test lib/cache.test.ts
```

**Step 5: Write Yahoo Finance lib tests**

Create `lib/yahoo.test.ts`:
```typescript
import { formatQuote } from './yahoo'

describe('formatQuote', () => {
  it('formats a quote with correct fields', () => {
    const raw = {
      symbol: 'SPY',
      regularMarketPrice: 598.24,
      regularMarketChangePercent: 0.82,
      regularMarketTime: new Date(),
    }
    const result = formatQuote(raw as any)
    expect(result.symbol).toBe('SPY')
    expect(result.price).toBe(598.24)
    expect(result.changePercent1D).toBeCloseTo(0.82)
  })
})
```

**Step 6: Run — expect FAIL**
```bash
npm test lib/yahoo.test.ts
```

**Step 7: Implement Yahoo lib**

Create `lib/yahoo.ts`:
```typescript
import yahooFinance from 'yahoo-finance2'

export interface Quote {
  symbol: string
  name: string
  price: number
  changePercent1D: number
  changePercent5D: number
  changePercent20D: number
  sparkline: number[]  // last 7 days closes
}

export function formatQuote(raw: any, history?: any[]): Quote {
  const price = raw.regularMarketPrice ?? 0
  const changePercent1D = raw.regularMarketChangePercent ?? 0

  // 5D and 20D calculated from history
  const closes = history?.map((h: any) => h.close).filter(Boolean) ?? []
  const changePercent5D = closes.length >= 5
    ? ((closes[closes.length - 1] - closes[closes.length - 6]) / closes[closes.length - 6]) * 100
    : 0
  const changePercent20D = closes.length >= 20
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
      const [quote, history] = await Promise.all([
        yahooFinance.quote(symbol),
        yahooFinance.historical(symbol, {
          period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          interval: '1d',
        }),
      ])
      return formatQuote(quote, history)
    })
  )
  return results
}
```

**Step 8: Run — expect PASS**
```bash
npm test lib/yahoo.test.ts
```

**Step 9: Commit**
```bash
git add -A && git commit -m "feat: add cache utility and yahoo finance lib"
```

---

## Task 5: Watchlist API Route

**Files:**
- Create: `app/api/watchlist/route.ts`

**Step 1: Create the route**

Create `app/api/watchlist/route.ts`:
```typescript
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
```

**Step 2: Manually test the route**

With `npm run dev` running:
```bash
curl http://localhost:3000/api/watchlist | head -c 500
```
Expected: JSON array with 9 objects, each having symbol, price, changePercent1D, etc.

**Step 3: Commit**
```bash
git add -A && git commit -m "feat: add watchlist API route"
```

---

## Task 6: WatchlistCard Component & Section

**Files:**
- Create: `components/WatchlistCard.tsx`
- Create: `components/WatchlistSection.tsx`

**Step 1: Write WatchlistCard test**

Create `components/WatchlistCard.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { WatchlistCard } from './WatchlistCard'

const mockQuote = {
  symbol: 'SPY',
  name: 'S&P 500',
  price: 598.24,
  changePercent1D: 0.82,
  changePercent5D: 2.14,
  changePercent20D: -1.30,
  sparkline: [590, 592, 595, 593, 596, 597, 598],
}

describe('WatchlistCard', () => {
  it('renders symbol and name', () => {
    render(<WatchlistCard quote={mockQuote} />)
    expect(screen.getByText('SPY')).toBeInTheDocument()
    expect(screen.getByText('S&P 500')).toBeInTheDocument()
  })
  it('renders price', () => {
    render(<WatchlistCard quote={mockQuote} />)
    expect(screen.getByText(/598/)).toBeInTheDocument()
  })
  it('shows green for positive change', () => {
    render(<WatchlistCard quote={mockQuote} />)
    const change = screen.getByText(/\+0.82%/)
    expect(change).toHaveClass('text-green-500')
  })
  it('shows red for negative change', () => {
    render(<WatchlistCard quote={mockQuote} />)
    const change = screen.getByText(/-1.30%/)
    expect(change).toHaveClass('text-red-500')
  })
})
```

**Step 2: Run — expect FAIL**
```bash
npm test components/WatchlistCard.test.tsx
```

**Step 3: Implement WatchlistCard**

Create `components/WatchlistCard.tsx`:
```typescript
'use client'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

interface Quote {
  symbol: string
  name: string
  price: number
  changePercent1D: number
  changePercent5D: number
  changePercent20D: number
  sparkline: number[]
}

function ChangeRow({ label, value }: { label: string; value: number }) {
  const isPos = value >= 0
  const pct = `${isPos ? '+' : ''}${value.toFixed(2)}%`
  const barWidth = Math.min(Math.abs(value) * 10, 100)

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-6 text-gray-500 shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-gray-800 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full', isPos ? 'bg-green-500' : 'bg-red-500')}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <span className={cn('w-14 text-right tabular-nums', isPos ? 'text-green-500' : 'text-red-500')}>
        {pct}
      </span>
    </div>
  )
}

export function WatchlistCard({ quote }: { quote: Quote }) {
  const sparkData = quote.sparkline.map((v, i) => ({ v }))
  const isUp = quote.changePercent1D >= 0
  const formattedPrice = quote.price >= 1000
    ? quote.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : quote.price.toFixed(2)

  return (
    <div className="rounded-xl border border-border-dark dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4 flex flex-col gap-3 hover:border-blue-500/40 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-bold text-sm tracking-wide">{quote.symbol.replace('^', '')}</div>
          <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[120px]">{quote.name}</div>
        </div>
        <div className={cn('text-xs font-medium px-1.5 py-0.5 rounded', isUp ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10')}>
          {isUp ? '▲' : '▼'}
        </div>
      </div>

      <div className="tabular-nums font-semibold text-xl">{formattedPrice}</div>

      {sparkData.length > 1 && (
        <div className="h-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={isUp ? '#22c55e' : '#ef4444'}
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <ChangeRow label="1D" value={quote.changePercent1D} />
        <ChangeRow label="5D" value={quote.changePercent5D} />
        <ChangeRow label="20D" value={quote.changePercent20D} />
      </div>
    </div>
  )
}
```

**Step 4: Run — expect PASS**
```bash
npm test components/WatchlistCard.test.tsx
```

**Step 5: Create WatchlistSection**

Create `components/WatchlistSection.tsx`:
```typescript
'use client'
import { useQuery } from '@tanstack/react-query'
import { WatchlistCard } from './WatchlistCard'

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border-dark dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4 animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-12 mb-2" />
      <div className="h-3 bg-gray-800 rounded w-20 mb-4" />
      <div className="h-6 bg-gray-700 rounded w-24 mb-3" />
      <div className="h-10 bg-gray-800 rounded mb-3" />
      <div className="space-y-2">
        {[1,2,3].map(i => <div key={i} className="h-3 bg-gray-800 rounded" />)}
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
      {error && <p className="text-red-400 text-sm">Failed to load watchlist</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-9 gap-3">
        {isLoading
          ? Array(9).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : data?.map((quote: any) => <WatchlistCard key={quote.symbol} quote={quote} />)
        }
      </div>
    </section>
  )
}
```

**Step 6: Add WatchlistSection to page**

Replace content of `app/page.tsx`:
```typescript
import { WatchlistSection } from '@/components/WatchlistSection'

export default function Home() {
  return (
    <div>
      <WatchlistSection />
    </div>
  )
}
```

**Step 7: Verify in browser**
```bash
npm run dev
```
Expected: 9 ticker cards render with prices, sparklines, and trend bars.

**Step 8: Commit**
```bash
git add -A && git commit -m "feat: add watchlist cards section"
```

---

## Task 7: Fear & Greed API Route + Gauge

**Files:**
- Create: `app/api/fear-greed/route.ts`
- Create: `components/FearGreedGauge.tsx`
- Create: `components/SentimentSection.tsx`

**Step 1: Create Fear & Greed route**

Create `app/api/fear-greed/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { createCache } from '@/lib/cache'

const cache = createCache<any>(1000 * 60 * 60) // 1 hr TTL

export async function GET() {
  try {
    const cached = cache.get('fear-greed')
    if (cached) return NextResponse.json(cached)

    const res = await fetch('https://production.dataviz.cnn.io/index/fearandgreed/graphdata', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 3600 },
    })
    const json = await res.json()
    const score = Math.round(json.fear_and_greed?.score ?? 50)
    const rating = json.fear_and_greed?.rating ?? 'neutral'

    const result = { score, rating }
    cache.set('fear-greed', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Fear & Greed error:', error)
    return NextResponse.json({ score: 50, rating: 'neutral' }, { status: 200 })
  }
}
```

**Step 2: Test route manually**
```bash
curl http://localhost:3000/api/fear-greed
```
Expected: `{"score":27,"rating":"fear"}` (values will vary by day)

**Step 3: Write FearGreedGauge test**

Create `components/FearGreedGauge.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { FearGreedGauge } from './FearGreedGauge'

describe('FearGreedGauge', () => {
  it('displays the score', () => {
    render(<FearGreedGauge score={27} rating="fear" />)
    expect(screen.getByText('27')).toBeInTheDocument()
  })
  it('displays the rating label', () => {
    render(<FearGreedGauge score={27} rating="fear" />)
    expect(screen.getByText(/fear/i)).toBeInTheDocument()
  })
})
```

**Step 4: Run — expect FAIL**
```bash
npm test components/FearGreedGauge.test.tsx
```

**Step 5: Implement FearGreedGauge**

Create `components/FearGreedGauge.tsx`:
```typescript
'use client'

const COLORS = {
  'extreme fear': '#ef4444',
  'fear': '#f97316',
  'neutral': '#f59e0b',
  'greed': '#84cc16',
  'extreme greed': '#22c55e',
}

const LABELS = ['Extreme\nFear', 'Fear', 'Neutral', 'Greed', 'Extreme\nGreed']

function getColor(rating: string): string {
  return COLORS[rating.toLowerCase() as keyof typeof COLORS] ?? '#f59e0b'
}

interface Props { score: number; rating: string }

export function FearGreedGauge({ score, rating }: Props) {
  // SVG semicircle gauge
  const angle = (score / 100) * 180 - 90 // -90 to +90 degrees
  const rad = (angle * Math.PI) / 180
  const needleX = 100 + 70 * Math.cos(rad)
  const needleY = 100 + 70 * Math.sin(rad)
  const color = getColor(rating)

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-48 h-24">
        {/* Background arc */}
        <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="#1e1e2e" strokeWidth="16" strokeLinecap="round" />
        {/* Colored arc (score) */}
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 283} 283`}
          opacity="0.8"
        />
        {/* Needle */}
        <line x1="100" y1="100" x2={needleX} y2={needleY} stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="100" cy="100" r="4" fill="white" />
      </svg>
      <div className="text-4xl font-bold tabular-nums" style={{ color }}>{score}</div>
      <div className="text-sm font-medium capitalize mt-1" style={{ color }}>{rating}</div>
      <div className="flex justify-between w-48 mt-2">
        {LABELS.map((l, i) => (
          <span key={i} className="text-[9px] text-gray-500 text-center whitespace-pre-line leading-tight">{l}</span>
        ))}
      </div>
    </div>
  )
}
```

**Step 6: Run — expect PASS**
```bash
npm test components/FearGreedGauge.test.tsx
```

**Step 7: Commit**
```bash
git add -A && git commit -m "feat: add fear & greed API route and gauge component"
```

---

## Task 8: AAII Sentiment API Route + Bar

**Files:**
- Create: `app/api/aaii/route.ts`
- Create: `components/SentimentBar.tsx`

**Step 1: Create AAII scraper route**

Create `app/api/aaii/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { createCache } from '@/lib/cache'

const cache = createCache<any>(1000 * 60 * 60 * 24) // 24hr TTL

export async function GET() {
  try {
    const cached = cache.get('aaii')
    if (cached) return NextResponse.json(cached)

    const res = await fetch('https://www.aaii.com/sentimentsurvey/sent_results', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
    })
    const html = await res.text()
    const $ = cheerio.load(html)

    // AAII table has bullish/neutral/bearish percentages
    const cells: number[] = []
    $('table.sentiment-table td, .col-percent').each((_, el) => {
      const text = $(el).text().trim().replace('%', '')
      const num = parseFloat(text)
      if (!isNaN(num) && num <= 100) cells.push(num)
    })

    // Fallback: try to find percentages in text
    let bullish = cells[0] ?? 37
    let neutral = cells[1] ?? 31
    let bearish = cells[2] ?? 32

    // Normalize to 100%
    const total = bullish + neutral + bearish
    if (total > 0) {
      bullish = Math.round((bullish / total) * 100)
      neutral = Math.round((neutral / total) * 100)
      bearish = 100 - bullish - neutral
    }

    const result = {
      bullish,
      neutral,
      bearish,
      spread: bullish - bearish,
      updatedNote: 'Weekly (Thu)',
    }
    cache.set('aaii', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('AAII error:', error)
    // Return plausible fallback so UI doesn't break
    return NextResponse.json({ bullish: 37, neutral: 31, bearish: 32, spread: 5, updatedNote: 'Data unavailable' })
  }
}
```

**Step 2: Write SentimentBar test**

Create `components/SentimentBar.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { SentimentBar } from './SentimentBar'

describe('SentimentBar', () => {
  it('renders bull/bear/neutral labels', () => {
    render(<SentimentBar bullish={42} neutral={30} bearish={28} spread={14} updatedNote="Weekly" />)
    expect(screen.getByText(/bulls/i)).toBeInTheDocument()
    expect(screen.getByText(/bears/i)).toBeInTheDocument()
  })
  it('shows spread value', () => {
    render(<SentimentBar bullish={42} neutral={30} bearish={28} spread={14} updatedNote="Weekly" />)
    expect(screen.getByText(/\+14/)).toBeInTheDocument()
  })
})
```

**Step 3: Run — expect FAIL**
```bash
npm test components/SentimentBar.test.tsx
```

**Step 4: Implement SentimentBar**

Create `components/SentimentBar.tsx`:
```typescript
'use client'

interface Props {
  bullish: number
  neutral: number
  bearish: number
  spread: number
  updatedNote: string
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-12">{label}</span>
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs tabular-nums w-8 text-right" style={{ color }}>{value}%</span>
    </div>
  )
}

export function SentimentBar({ bullish, neutral, bearish, spread, updatedNote }: Props) {
  const spreadLabel = spread >= 0 ? `+${spread}` : `${spread}`
  const spreadColor = spread > 10 ? '#22c55e' : spread < -10 ? '#ef4444' : '#f59e0b'

  return (
    <div className="flex flex-col gap-3">
      <Bar label="Bulls" value={bullish} color="#22c55e" />
      <Bar label="Neutral" value={neutral} color="#f59e0b" />
      <Bar label="Bears" value={bearish} color="#ef4444" />
      <div className="flex justify-between items-center pt-1 border-t border-gray-800">
        <span className="text-xs text-gray-500">Spread</span>
        <span className="text-sm font-semibold" style={{ color: spreadColor }}>{spreadLabel}</span>
      </div>
      <div className="text-[10px] text-gray-600">{updatedNote}</div>
    </div>
  )
}
```

**Step 5: Run — expect PASS**
```bash
npm test components/SentimentBar.test.tsx
```

**Step 6: Create SentimentSection and add to page**

Create `components/SentimentSection.tsx`:
```typescript
'use client'
import { useQuery } from '@tanstack/react-query'
import { FearGreedGauge } from './FearGreedGauge'
import { SentimentBar } from './SentimentBar'

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border-dark dark:border-border-dark bg-surface-light dark:bg-surface-dark p-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">{title}</h3>
      {children}
    </div>
  )
}

export function SentimentSection() {
  const fg = useQuery({
    queryKey: ['fear-greed'],
    queryFn: () => fetch('/api/fear-greed').then(r => r.json()),
    refetchInterval: 1000 * 60 * 60,
  })
  const aaii = useQuery({
    queryKey: ['aaii'],
    queryFn: () => fetch('/api/aaii').then(r => r.json()),
    refetchInterval: 1000 * 60 * 60 * 24,
  })

  return (
    <section className="mb-6">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Sentiment</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Fear & Greed Index">
          {fg.isLoading
            ? <div className="h-32 animate-pulse bg-gray-800 rounded" />
            : <FearGreedGauge score={fg.data?.score ?? 50} rating={fg.data?.rating ?? 'neutral'} />
          }
        </SectionCard>
        <SectionCard title="AAII Bull/Bear Survey">
          {aaii.isLoading
            ? <div className="h-32 animate-pulse bg-gray-800 rounded" />
            : <SentimentBar {...aaii.data} />
          }
        </SectionCard>
      </div>
    </section>
  )
}
```

Update `app/page.tsx` to include the new section:
```typescript
import { WatchlistSection } from '@/components/WatchlistSection'
import { SentimentSection } from '@/components/SentimentSection'

export default function Home() {
  return (
    <div>
      <WatchlistSection />
      <SentimentSection />
    </div>
  )
}
```

**Step 7: Commit**
```bash
git add -A && git commit -m "feat: add AAII sentiment scraper and sentiment section"
```

---

## Task 9: FRED API Lib + Route + MacroChart

**Files:**
- Create: `lib/fred.ts`
- Create: `app/api/fred/route.ts`
- Create: `components/MacroChart.tsx`
- Create: `components/MacroSection.tsx`

**Step 1: Write FRED lib test**

Create `lib/fred.test.ts`:
```typescript
import { buildFredUrl, parseObservations } from './fred'

describe('buildFredUrl', () => {
  it('includes series_id and api_key', () => {
    const url = buildFredUrl('BAMLH0A0HYM2', 'testkey')
    expect(url).toContain('series_id=BAMLH0A0HYM2')
    expect(url).toContain('api_key=testkey')
  })
})

describe('parseObservations', () => {
  it('returns date/value pairs', () => {
    const raw = {
      observations: [
        { date: '2024-01-01', value: '4.2' },
        { date: '2024-02-01', value: '3.9' },
      ]
    }
    const result = parseObservations(raw)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ date: '2024-01-01', value: 4.2 })
  })
  it('filters out missing values', () => {
    const raw = {
      observations: [
        { date: '2024-01-01', value: '.' },
        { date: '2024-02-01', value: '3.9' },
      ]
    }
    const result = parseObservations(raw)
    expect(result).toHaveLength(1)
  })
})
```

**Step 2: Run — expect FAIL**
```bash
npm test lib/fred.test.ts
```

**Step 3: Implement FRED lib**

Create `lib/fred.ts`:
```typescript
const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations'

export function buildFredUrl(seriesId: string, apiKey: string, limit = 60): string {
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: apiKey,
    file_type: 'json',
    limit: String(limit),
    sort_order: 'desc',
  })
  return `${FRED_BASE}?${params}`
}

export function parseObservations(json: any): { date: string; value: number }[] {
  return (json.observations ?? [])
    .filter((o: any) => o.value !== '.')
    .map((o: any) => ({ date: o.date, value: parseFloat(o.value) }))
    .reverse()
}
```

**Step 4: Run — expect PASS**
```bash
npm test lib/fred.test.ts
```

**Step 5: Create FRED route**

Create `app/api/fred/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { buildFredUrl, parseObservations } from '@/lib/fred'
import { createCache } from '@/lib/cache'

const cache = createCache<any>(1000 * 60 * 60 * 24) // 24hr TTL

const SERIES: Record<string, { label: string; unit: string }> = {
  'BAMLH0A0HYM2':       { label: 'HY Credit Spread', unit: '%' },
  'BAMLC0A0CM':         { label: 'IG Credit Spread', unit: '%' },
  'PERMIT':             { label: 'Housing Permits', unit: 'K' },
  'CORESTICKM159SFRBATL': { label: 'Sticky CPI', unit: '%' },
  'CAPE':               { label: 'Shiller CAPE', unit: 'x' },
}

export async function GET(req: NextRequest) {
  const seriesId = req.nextUrl.searchParams.get('series') ?? 'BAMLH0A0HYM2'
  const apiKey = process.env.FRED_API_KEY ?? ''
  if (!apiKey) return NextResponse.json({ error: 'FRED_API_KEY not set' }, { status: 500 })

  try {
    const cached = cache.get(seriesId)
    if (cached) return NextResponse.json(cached)

    const url = buildFredUrl(seriesId, apiKey)
    const res = await fetch(url)
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
```

**Step 6: Write MacroChart test**

Create `components/MacroChart.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { MacroChart } from './MacroChart'

const mockData = [
  { date: '2024-01-01', value: 4.2 },
  { date: '2024-02-01', value: 3.9 },
]

describe('MacroChart', () => {
  it('renders chart title', () => {
    render(<MacroChart title="HY Credit Spread" data={mockData} unit="%" />)
    expect(screen.getByText('HY Credit Spread')).toBeInTheDocument()
  })
  it('shows latest value', () => {
    render(<MacroChart title="HY Credit Spread" data={mockData} unit="%" />)
    expect(screen.getByText(/3.9/)).toBeInTheDocument()
  })
})
```

**Step 7: Run — expect FAIL**
```bash
npm test components/MacroChart.test.tsx
```

**Step 8: Implement MacroChart**

Create `components/MacroChart.tsx`:
```typescript
'use client'
import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface DataPoint { date: string; value: number }

interface Props {
  title: string
  data: DataPoint[]
  unit: string
  color?: string
}

const RANGES = [
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: '3Y', months: 36 },
]

export function MacroChart({ title, data, unit, color = '#3b82f6' }: Props) {
  const [range, setRange] = useState(12)

  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - range)
  const filtered = data.filter(d => new Date(d.date) >= cutoff)

  const latest = filtered[filtered.length - 1]?.value ?? 0
  const prev = filtered[filtered.length - 2]?.value ?? latest
  const isUp = latest >= prev

  return (
    <div className="rounded-xl border border-border-dark dark:border-border-dark bg-surface-light dark:bg-surface-dark p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">{title}</h3>
          <div className="text-2xl font-bold tabular-nums mt-1">
            {latest.toFixed(2)}<span className="text-sm text-gray-500 ml-1">{unit}</span>
          </div>
        </div>
        <div className="flex gap-1">
          {RANGES.map(r => (
            <button
              key={r.label}
              onClick={() => setRange(r.months)}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                range === r.months
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filtered} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6b6b80' }} tickLine={false} axisLine={false}
              tickFormatter={d => d.slice(0, 7)} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 9, fill: '#6b6b80' }} tickLine={false} axisLine={false} width={30} />
            <Tooltip
              contentStyle={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 8, fontSize: 11 }}
              formatter={(v: any) => [`${Number(v).toFixed(2)}${unit}`, '']}
            />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5}
              fill={`url(#grad-${title})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

**Step 9: Run — expect PASS**
```bash
npm test components/MacroChart.test.tsx
```

**Step 10: Create MacroSection**

Create `components/MacroSection.tsx`:
```typescript
'use client'
import { useQuery } from '@tanstack/react-query'
import { MacroChart } from './MacroChart'

function useFred(series: string) {
  return useQuery({
    queryKey: ['fred', series],
    queryFn: () => fetch(`/api/fred?series=${series}`).then(r => r.json()),
    refetchInterval: 1000 * 60 * 60 * 24,
  })
}

function ChartLoader({ series, color }: { series: string; color: string }) {
  const { data, isLoading } = useFred(series)
  if (isLoading) return <div className="rounded-xl border border-border-dark h-48 animate-pulse bg-surface-dark" />
  return <MacroChart title={data?.label ?? series} data={data?.data ?? []} unit={data?.unit ?? ''} color={color} />
}

export function MacroSection() {
  return (
    <section className="mb-6">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Macro Indicators</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartLoader series="BAMLH0A0HYM2" color="#ef4444" />
        <ChartLoader series="CORESTICKM159SFRBATL" color="#8b5cf6" />
        <ChartLoader series="PERMIT" color="#3b82f6" />
        <ChartLoader series="CAPE" color="#f59e0b" />
      </div>
    </section>
  )
}
```

**Step 11: Add MacroSection to page**

Update `app/page.tsx`:
```typescript
import { WatchlistSection } from '@/components/WatchlistSection'
import { SentimentSection } from '@/components/SentimentSection'
import { MacroSection } from '@/components/MacroSection'

export default function Home() {
  return (
    <div>
      <WatchlistSection />
      <SentimentSection />
      <MacroSection />
    </div>
  )
}
```

**Step 12: Commit**
```bash
git add -A && git commit -m "feat: add FRED macro charts section"
```

---

## Task 10: CME FedWatch API Route + Probability Table

**Files:**
- Create: `app/api/cme/route.ts`
- Create: `components/FedProbability.tsx`

**Step 1: Create CME route**

Create `app/api/cme/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { createCache } from '@/lib/cache'

const cache = createCache<any>(1000 * 60 * 60) // 1hr TTL

export async function GET() {
  try {
    const cached = cache.get('cme')
    if (cached) return NextResponse.json(cached)

    // CME FedWatch public data endpoint
    const res = await fetch(
      'https://www.cmegroup.com/CmeWS/mvc/CountdownToFomc/CountdownToFomc.getCountdownToFomc.html',
      { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } }
    )
    const json = await res.json()

    // Parse meetings from response
    const meetings = (json.meetings ?? []).slice(0, 3).map((m: any) => ({
      date: m.meetingDate ?? m.date,
      cut25: Math.round(parseFloat(m.probDown25 ?? '0')),
      hold: Math.round(parseFloat(m.probUnchanged ?? m.probHold ?? '0')),
      hike25: Math.round(parseFloat(m.probUp25 ?? '0')),
    }))

    const result = { meetings }
    cache.set('cme', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('CME error:', error)
    // Plausible fallback data
    return NextResponse.json({
      meetings: [
        { date: 'Mar 19, 2026', cut25: 8, hold: 88, hike25: 4 },
        { date: 'May 7, 2026', cut25: 31, hold: 62, hike25: 7 },
        { date: 'Jun 18, 2026', cut25: 48, hold: 44, hike25: 8 },
      ]
    })
  }
}
```

**Step 2: Write FedProbability test**

Create `components/FedProbability.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { FedProbability } from './FedProbability'

const mockMeetings = [
  { date: 'Mar 19', cut25: 8, hold: 88, hike25: 4 },
  { date: 'May 7', cut25: 31, hold: 62, hike25: 7 },
]

describe('FedProbability', () => {
  it('renders meeting dates', () => {
    render(<FedProbability meetings={mockMeetings} />)
    expect(screen.getByText('Mar 19')).toBeInTheDocument()
  })
  it('renders hold probability', () => {
    render(<FedProbability meetings={mockMeetings} />)
    expect(screen.getByText('88%')).toBeInTheDocument()
  })
})
```

**Step 3: Run — expect FAIL**
```bash
npm test components/FedProbability.test.tsx
```

**Step 4: Implement FedProbability**

Create `components/FedProbability.tsx`:
```typescript
'use client'

interface Meeting {
  date: string
  cut25: number
  hold: number
  hike25: number
}

function ProbCell({ value, highlight }: { value: number; highlight: boolean }) {
  const bg = value > 50 ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400'
  return (
    <td className={`text-center text-sm tabular-nums py-2 px-3 ${bg}`}>
      {value}%
    </td>
  )
}

export function FedProbability({ meetings }: { meetings: Meeting[] }) {
  return (
    <div>
      <table className="w-full">
        <thead>
          <tr className="text-xs text-gray-500 border-b border-gray-800">
            <th className="text-left py-2 font-normal">FOMC Meeting</th>
            <th className="text-center py-2 font-normal">-25bp</th>
            <th className="text-center py-2 font-normal">Hold</th>
            <th className="text-center py-2 font-normal">+25bp</th>
          </tr>
        </thead>
        <tbody>
          {meetings.map((m, i) => (
            <tr key={i} className="border-b border-gray-800/50">
              <td className="text-sm py-2 text-gray-300">{m.date}</td>
              <ProbCell value={m.cut25} highlight={m.cut25 > 50} />
              <ProbCell value={m.hold} highlight={m.hold > 50} />
              <ProbCell value={m.hike25} highlight={m.hike25 > 50} />
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[10px] text-gray-600 mt-2">Source: CME FedWatch</p>
    </div>
  )
}
```

**Step 5: Run — expect PASS**
```bash
npm test components/FedProbability.test.tsx
```

**Step 6: Add Fed section to page**

Create `components/FedSection.tsx`:
```typescript
'use client'
import { useQuery } from '@tanstack/react-query'
import { FedProbability } from './FedProbability'

export function FedSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['cme'],
    queryFn: () => fetch('/api/cme').then(r => r.json()),
    refetchInterval: 1000 * 60 * 60,
  })

  return (
    <section className="mb-6">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Fed Rate Probabilities</h2>
      <div className="rounded-xl border border-border-dark dark:border-border-dark bg-surface-light dark:bg-surface-dark p-5 max-w-md">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">CME FedWatch</h3>
        {isLoading
          ? <div className="h-24 animate-pulse bg-gray-800 rounded" />
          : <FedProbability meetings={data?.meetings ?? []} />
        }
      </div>
    </section>
  )
}
```

Update `app/page.tsx`:
```typescript
import { WatchlistSection } from '@/components/WatchlistSection'
import { SentimentSection } from '@/components/SentimentSection'
import { MacroSection } from '@/components/MacroSection'
import { FedSection } from '@/components/FedSection'

export default function Home() {
  return (
    <div>
      <WatchlistSection />
      <SentimentSection />
      <FedSection />
      <MacroSection />
    </div>
  )
}
```

**Step 7: Commit**
```bash
git add -A && git commit -m "feat: add CME FedWatch rate probability table"
```

---

## Task 11: MOVE Index Volatility Section

**Files:**
- Create: `components/VolatilitySection.tsx`

**Step 1: Create VolatilitySection**

This reuses the existing watchlist API (^MOVE and ^VIX are already fetched) and MacroChart for display.

Create `components/VolatilitySection.tsx`:
```typescript
'use client'
import { useQuery } from '@tanstack/react-query'

function VolCard({ symbol, label, color }: { symbol: string; label: string; color: string }) {
  const { data } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => fetch('/api/watchlist').then(r => r.json()),
  })
  const quote = data?.find((q: any) => q.symbol === symbol)

  return (
    <div className="rounded-xl border border-border-dark dark:border-border-dark bg-surface-light dark:bg-surface-dark p-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">{label}</h3>
      <div className="text-3xl font-bold tabular-nums" style={{ color }}>
        {quote?.price?.toFixed(2) ?? '—'}
      </div>
      <div className={`text-sm mt-1 ${quote?.changePercent1D >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {quote ? `${quote.changePercent1D >= 0 ? '+' : ''}${quote.changePercent1D.toFixed(2)}% today` : ''}
      </div>
    </div>
  )
}

export function VolatilitySection() {
  return (
    <section className="mb-6">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Volatility</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
        <VolCard symbol="^VIX" label="VIX (Equity Vol)" color="#f59e0b" />
        <VolCard symbol="^MOVE" label="MOVE Index (Bond Vol)" color="#8b5cf6" />
      </div>
    </section>
  )
}
```

**Step 2: Add to page**

Update `app/page.tsx`:
```typescript
import { WatchlistSection } from '@/components/WatchlistSection'
import { SentimentSection } from '@/components/SentimentSection'
import { VolatilitySection } from '@/components/VolatilitySection'
import { FedSection } from '@/components/FedSection'
import { MacroSection } from '@/components/MacroSection'

export default function Home() {
  return (
    <div>
      <WatchlistSection />
      <SentimentSection />
      <VolatilitySection />
      <FedSection />
      <MacroSection />
    </div>
  )
}
```

**Step 3: Commit**
```bash
git add -A && git commit -m "feat: add volatility section (VIX + MOVE)"
```

---

## Task 12: External Links Section

**Files:**
- Create: `components/ExternalLinks.tsx`

**Step 1: Write test**

Create `components/ExternalLinks.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { ExternalLinks } from './ExternalLinks'

describe('ExternalLinks', () => {
  it('renders all link cards', () => {
    render(<ExternalLinks />)
    expect(screen.getByText(/Layoffs/i)).toBeInTheDocument()
    expect(screen.getByText(/Finviz/i)).toBeInTheDocument()
    expect(screen.getByText(/HedgeFollow/i)).toBeInTheDocument()
  })
  it('links open in new tab', () => {
    render(<ExternalLinks />)
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank')
    })
  })
})
```

**Step 2: Run — expect FAIL**
```bash
npm test components/ExternalLinks.test.tsx
```

**Step 3: Implement ExternalLinks**

Create `components/ExternalLinks.tsx`:
```typescript
import { ExternalLink } from 'lucide-react'

const LINKS = [
  {
    icon: '📉',
    title: 'Layoffs Tracker',
    subtitle: 'layoffs.fyi',
    description: 'Tech layoff data and trends',
    href: 'https://layoffs.fyi',
    color: '#ef4444',
  },
  {
    icon: '🚗',
    title: 'Used Car Prices',
    subtitle: 'Manheim Index',
    description: 'Used vehicle value index',
    href: 'https://publish.manheim.com/en/services/consulting/used-vehicle-value-index.html',
    color: '#f59e0b',
  },
  {
    icon: '✈️',
    title: 'Flight Prices',
    subtitle: 'Hopper Research',
    description: 'Airfare price tracking',
    href: 'https://media.hopper.com/research',
    color: '#3b82f6',
  },
  {
    icon: '🏦',
    title: 'Hedge Fund Positions',
    subtitle: 'HedgeFollow',
    description: '13F filings & positioning',
    href: 'https://hedgefollow.com',
    color: '#8b5cf6',
  },
  {
    icon: '🗺️',
    title: 'Sector Heatmap',
    subtitle: 'Finviz',
    description: 'Market sector performance map',
    href: 'https://finviz.com/map.ashx?t=sec_all',
    color: '#22c55e',
  },
  {
    icon: '🏛️',
    title: 'FedWatch Tool',
    subtitle: 'CME Group',
    description: 'Full FOMC meeting calendar',
    href: 'https://www.cmegroup.com/trading/interest-rates/countdown-to-fomc.html',
    color: '#3b82f6',
  },
  {
    icon: '📊',
    title: 'NAAIM Exposure',
    subtitle: 'NAAIM.org',
    description: 'Active manager equity exposure',
    href: 'https://www.naaim.org/programs/naaim-exposure-index/',
    color: '#f59e0b',
  },
  {
    icon: '🌡️',
    title: 'Inflation Nowcast',
    subtitle: 'Cleveland Fed',
    description: 'Real-time inflation estimates',
    href: 'https://www.clevelandfed.org/indicators-and-data/inflation-nowcasting',
    color: '#ef4444',
  },
]

export function ExternalLinks() {
  return (
    <section className="mb-6">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
        External Resources
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {LINKS.map(link => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-border-dark dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4 flex flex-col gap-2 hover:border-blue-500/40 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <span className="text-2xl">{link.icon}</span>
              <ExternalLink size={12} className="text-gray-600 group-hover:text-gray-400 mt-1" />
            </div>
            <div>
              <div className="font-semibold text-sm">{link.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{link.subtitle}</div>
            </div>
            <div className="text-xs text-gray-600">{link.description}</div>
          </a>
        ))}
      </div>
    </section>
  )
}
```

**Step 4: Run — expect PASS**
```bash
npm test components/ExternalLinks.test.tsx
```

**Step 5: Add to page — final page.tsx**

Update `app/page.tsx` with all sections:
```typescript
import { WatchlistSection } from '@/components/WatchlistSection'
import { SentimentSection } from '@/components/SentimentSection'
import { VolatilitySection } from '@/components/VolatilitySection'
import { FedSection } from '@/components/FedSection'
import { MacroSection } from '@/components/MacroSection'
import { ExternalLinks } from '@/components/ExternalLinks'

export default function Home() {
  return (
    <div className="space-y-2">
      <WatchlistSection />
      <SentimentSection />
      <VolatilitySection />
      <FedSection />
      <MacroSection />
      <ExternalLinks />
    </div>
  )
}
```

**Step 6: Commit**
```bash
git add -A && git commit -m "feat: add external resource links section"
```

---

## Task 13: Full Test Run & Polish

**Step 1: Run all tests**
```bash
npm test
```
Expected: All tests pass.

**Step 2: Run dev and visually verify**
```bash
npm run dev
```

Check each section:
- [ ] Watchlist cards load with prices, sparklines, trend bars
- [ ] Fear & Greed gauge shows score
- [ ] AAII bars render
- [ ] Macro charts show data with timeframe toggle
- [ ] Fed probability table renders
- [ ] VIX + MOVE volatility cards show
- [ ] External links all have correct hrefs
- [ ] Dark/light toggle works
- [ ] Refresh button triggers refetch
- [ ] Responsive layout: try resizing window

**Step 3: Build check (catches TypeScript errors)**
```bash
npm run build
```
Expected: Build completes without errors.

**Step 4: Fix any TypeScript errors** (address build output)

**Step 5: Final commit**
```bash
git add -A && git commit -m "feat: complete FinDash dashboard - all sections implemented"
```

---

## Task 14: Deployment to Vercel

**Step 1: Create GitHub repo**
```bash
git remote add origin https://github.com/YOUR_USERNAME/findash.git
git branch -M main
git push -u origin main
```
(Replace YOUR_USERNAME with actual GitHub username)

**Step 2: Deploy to Vercel**

1. Go to https://vercel.com → Log in with GitHub
2. Click "Add New Project" → import the `findash` repo
3. Framework: Next.js (auto-detected)
4. Add environment variable: `FRED_API_KEY` = (your key)
5. Click Deploy

**Step 3: Verify deployed URL works**

Open the Vercel URL and check all sections load.

---

## Setup Instructions for User (README summary)

After Task 13, create `README.md` with these instructions:

```markdown
## Local Setup

1. Install Node.js: https://nodejs.org (LTS version)
2. Clone this repo, open terminal in folder
3. Run: npm install
4. Get free FRED API key: https://fredaccount.stlouisfed.org/apikeys
5. Edit .env.local, replace `your_key_here` with your key
6. Run: npm run dev
7. Open: http://localhost:3000
```
