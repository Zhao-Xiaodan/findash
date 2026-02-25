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

export function parseObservations(json: { observations?: Array<{ date: string; value: string }> }): { date: string; value: number }[] {
  return (json.observations ?? [])
    .filter((o) => o.value !== '.')
    .map((o) => ({ date: o.date, value: parseFloat(o.value) }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
