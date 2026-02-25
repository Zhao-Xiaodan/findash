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
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
        Fed Rate Probabilities
      </h2>
      <div className="rounded-xl border border-gray-800 bg-[#13131a] p-5 max-w-sm">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
          CME FedWatch — Next 3 FOMC Meetings
        </h3>
        {isLoading
          ? <div className="h-24 animate-pulse bg-gray-800 rounded" />
          : <FedProbability meetings={data?.meetings ?? []} />
        }
      </div>
    </section>
  )
}
