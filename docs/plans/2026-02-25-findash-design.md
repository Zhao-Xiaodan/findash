# FinDash — Financial Market Dashboard Design

**Date:** 2026-02-25
**Status:** Approved
**Stack:** Next.js 14 (App Router) + Tailwind CSS + React Query + Tremor

---

## 1. Purpose

A personal financial market dashboard that replaces a Notion page + Google Sheets setup. Tracks market sentiment, macro indicators, index trends, and links to key external data sources. Runs locally on macOS, deployable to Vercel for any-device access.

---

## 2. Layout

Single-page dashboard. Sticky header, scrollable sections below.

```
Header: Logo | Last updated | Dark/Light toggle | Manual refresh
─────────────────────────────────────────────────────────────────
Section 1: Market Watchlist (hero — 9 ticker cards in grid)
─────────────────────────────────────────────────────────────────
Section 2: Sentiment | Volatility
─────────────────────────────────────────────────────────────────
Section 3: Valuation | Market Breadth
─────────────────────────────────────────────────────────────────
Section 4: Fed & Macro (rate probability, credit spreads, CPI, housing)
─────────────────────────────────────────────────────────────────
Section 5: Real Economy Links (external site cards)
─────────────────────────────────────────────────────────────────
```

---

## 3. Watchlist Cards

Tickers: SPY, QQQ, ^DJI, IWM, ^VIX, TLT, GLD, DX-Y.NYB, BTC-USD

Each card shows:
- Current price (large, monospace)
- 1-day % change
- 5-day % change
- 20-day % change
- 7-day sparkline

Color coding: green = positive, red = negative, yellow = flat (±0.2%).

Grid: 3×3 desktop → 2-col tablet → 1-col mobile.

---

## 4. Dashboard Sections

### 4.1 Sentiment
- **Fear & Greed Index** — semicircle gauge, score + label (Extreme Fear → Extreme Greed)
- **AAII Bull/Bear Survey** — horizontal bars, bull%, bear%, neutral%, spread label

### 4.2 Volatility
- **MOVE Index** (^MOVE) — current value card + 90-day line chart
- **VIX detail** — current value + historical context band

### 4.3 Valuation
- **Shiller CAPE** — current value + 30-year line chart (FRED: CAPE series)
- **S&P Forward PE** — link card to Yardeni PDF (no public API)

### 4.4 Market Breadth
- **McClellan Oscillator** — calculated from NYSE advance/decline data, line chart
- **% Stocks above 200MA** — line chart

### 4.5 Fed & Macro
- **CME FedWatch** — table of cut/hold/hike probabilities for next 3 FOMC meetings
- **Credit Spreads** — HY spread line chart (FRED: BAMLH0A0HYM2)
- **Sticky CPI** — Atlanta Fed series via FRED, line chart
- **Housing Permits** — FRED PERMIT series, line chart

### 4.6 Real Economy Links
External site cards (open in new tab):
- Layoffs.fyi (layoff tracker)
- Manheim Used Vehicle Value Index
- Hopper Research Dashboard (flight prices)
- HedgeFollow (hedge fund positions)
- Finviz Sector Heatmap
- CME FedWatch (full tool)
- Cleveland Fed Inflation Nowcasting
- NAAIM Exposure Index

---

## 5. Data Sources

| Indicator | Source | Method | Refresh |
|---|---|---|---|
| All 9 watchlist tickers | Yahoo Finance | `yahoo-finance2` npm | 5 min |
| Fear & Greed | CNN | Public JSON endpoint | 60 min |
| AAII Sentiment | AAII.com | HTML scrape (`cheerio`) | 24 hr |
| MOVE Index | Yahoo Finance | `^MOVE` symbol | 5 min |
| Shiller CAPE | FRED API | Series: `CAPE` | 24 hr |
| Credit Spreads | FRED API | Series: `BAMLH0A0HYM2` | 24 hr |
| Sticky CPI | FRED API | Series: `CORESTICKM159SFRBATL` | 24 hr |
| Housing Permits | FRED API | Series: `PERMIT` | 24 hr |
| McClellan Oscillator | Calculated | NYSE A/D via Yahoo Finance | 60 min |
| CME FedWatch | CME Group | Public JSON endpoint | 60 min |

**Required:** One free FRED API key (fred.stlouisfed.org → My Account → API Keys).

---

## 6. Technical Architecture

### Stack
- **Framework:** Next.js 14 App Router
- **Styling:** Tailwind CSS + `next-themes` (dark/light)
- **Charts/UI:** Tremor (`@tremor/react`) — gauges, line charts, bars
- **Data fetching:** React Query (client polling + cache)
- **Yahoo Finance:** `yahoo-finance2`
- **Scraping:** `cheerio`
- **Font:** Inter (tabular-nums for price alignment)

### Project Structure
```
app/
  page.tsx                  # Main dashboard
  layout.tsx                # Theme provider, fonts
  api/
    watchlist/route.ts      # Yahoo Finance prices + history
    fear-greed/route.ts     # CNN endpoint
    aaii/route.ts           # AAII scraper
    fred/route.ts           # FRED multi-series
    cme/route.ts            # CME FedWatch
    breadth/route.ts        # McClellan Oscillator
components/
  WatchlistCard.tsx
  FearGreedGauge.tsx
  SentimentBar.tsx
  MacroChart.tsx            # Reusable recharts line chart
  FedProbability.tsx
  ExternalLinks.tsx
  ThemeToggle.tsx
lib/
  yahoo.ts
  fred.ts
  cache.ts                  # In-memory 15-min cache
.env.local                  # FRED_API_KEY
```

### Data Flow
```
Browser (React Query, polls per section TTL)
    ↓
Next.js API Routes (proxy + in-memory cache)
    ↓
External APIs (Yahoo Finance, CNN, FRED, CME, AAII)
```

Cache TTLs: prices = 5 min, sentiment/macro = 60 min, FRED/AAII = 24 hr.

---

## 7. Visual Design

### Colors
| Token | Dark | Light |
|---|---|---|
| Background | `#0a0a0f` | `#f4f4f8` |
| Surface | `#13131a` | `#ffffff` |
| Border | `#1e1e2e` | `#e2e2ea` |
| Text | `#e8e8f0` | `#0a0a0f` |
| Green | `#22c55e` | `#22c55e` |
| Red | `#ef4444` | `#ef4444` |
| Yellow | `#f59e0b` | `#f59e0b` |
| Blue | `#3b82f6` | `#3b82f6` |
| Purple | `#8b5cf6` | `#8b5cf6` |

### Typography
- Font: Inter
- Numbers: `font-variant-numeric: tabular-nums` (columns stay aligned as values update)

---

## 8. Deployment

- **Local:** `npm run dev` → `localhost:3000`
- **Production:** Push to GitHub → connect to Vercel → auto-deploy
- **Env vars:** Set `FRED_API_KEY` in Vercel dashboard (same as `.env.local`)
