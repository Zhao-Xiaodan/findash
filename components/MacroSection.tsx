'use client'
import { useQuery } from '@tanstack/react-query'
import { MacroChart } from './MacroChart'

const MACRO_SERIES = [
  { series: 'BAMLH0A0HYM2', color: '#ef4444' },
  { series: 'CORESTICKM159SFRBATL', color: '#8b5cf6' },
  { series: 'PERMIT', color: '#3b82f6' },
  { series: 'T10Y2Y', color: '#f59e0b' },
]

function MacroChartLoader({ series, color }: { series: string; color: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['fred', series],
    queryFn: () => fetch(`/api/fred?series=${series}`).then(r => r.json()),
    refetchInterval: 1000 * 60 * 60 * 24,
  })

  if (isLoading) {
    return <div className="rounded-xl border border-gray-800 h-52 animate-pulse bg-[#13131a]" />
  }
  if (error || data?.error) {
    return (
      <div className="rounded-xl border border-gray-800 bg-[#13131a] p-5 flex items-center justify-center h-52">
        <p className="text-gray-600 text-xs text-center">
          {data?.error ?? 'Failed to load'}<br />
          <span className="text-gray-700">Set FRED_API_KEY in .env.local</span>
        </p>
      </div>
    )
  }
  return <MacroChart title={data?.label ?? series} data={data?.data ?? []} unit={data?.unit ?? ''} color={color} />
}

export function MacroSection() {
  return (
    <section className="mb-6">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Macro Indicators</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MACRO_SERIES.map(({ series, color }) => (
          <MacroChartLoader key={series} series={series} color={color} />
        ))}
      </div>
    </section>
  )
}
