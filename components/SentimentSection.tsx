'use client'
import { useQuery } from '@tanstack/react-query'
import { FearGreedGauge } from './FearGreedGauge'
import { SentimentBar } from './SentimentBar'

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#13131a] p-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-800 rounded ${className ?? 'h-32'}`} />
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
            ? <Skeleton className="h-40" />
            : <FearGreedGauge score={fg.data?.score ?? 50} rating={fg.data?.rating ?? 'neutral'} />
          }
        </SectionCard>
        <SectionCard title="AAII Bull/Bear Survey">
          {aaii.isLoading
            ? <Skeleton className="h-40" />
            : <SentimentBar
                bullish={aaii.data?.bullish ?? 37}
                neutral={aaii.data?.neutral ?? 31}
                bearish={aaii.data?.bearish ?? 32}
                spread={aaii.data?.spread ?? 5}
                updatedNote={aaii.data?.updatedNote ?? 'Weekly (Thu)'}
              />
          }
        </SectionCard>
      </div>
    </section>
  )
}
