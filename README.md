# FinDash - Personal Financial Market Dashboard

A personal financial market dashboard built with Next.js 14. Tracks market sentiment, macro indicators, index trends, and links to key external data sources -- replacing a Notion + Google Sheets setup.

## What It Shows

| Section | Indicators |
|---|---|
| **Watchlist** | SPY, QQQ, DJI, IWM, VIX, TLT, GLD, DXY, BTC -- with 1D/5D/20D trends |
| **Sentiment** | Fear & Greed Index (CNN), AAII Bull/Bear Survey |
| **Volatility** | VIX, MOVE Index (bond market vol) |
| **Fed** | CME FedWatch rate cut/hold/hike probabilities |
| **Macro** | HY Credit Spread, Sticky CPI, Housing Permits, Shiller CAPE |
| **Links** | Layoffs.fyi, Manheim, Hopper, HedgeFollow, Finviz, NAAIM, Cleveland Fed |

## Local Setup

### Prerequisites
- [Node.js](https://nodejs.org) (LTS version, 18+)
- A free [FRED API key](https://fredaccount.stlouisfed.org/apikeys) (for macro charts)

### Steps

1. **Clone and install**
   ```bash
   git clone <your-repo-url>
   cd Web_finance
   npm install
   ```

2. **Add your FRED API key**

   Edit `.env.local` and replace `your_key_here`:
   ```
   FRED_API_KEY=abcdef1234567890...
   ```

3. **Run locally**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel (Free)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) -> **Add New Project** -> import your repo
3. Add environment variable: `FRED_API_KEY` = your key
4. Click **Deploy**

That's it -- Vercel auto-deploys on every push.

## Development

```bash
npm run dev      # Start dev server (localhost:3000)
npm test         # Run all tests
npm run build    # Production build check
```

## Data Sources

| Indicator | Source | Refresh |
|---|---|---|
| All index prices | Yahoo Finance (free) | 5 min |
| Fear & Greed | CNN (public) | 1 hr |
| AAII Sentiment | AAII.com (scraped) | 24 hr |
| Macro charts | FRED API (free key) | 24 hr |
| Fed rate probs | CME FedWatch (public) | 1 hr |
