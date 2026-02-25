import { ExternalLink } from 'lucide-react'

const LINKS = [
  {
    icon: '📉',
    title: 'Layoffs Tracker',
    subtitle: 'layoffs.fyi',
    description: 'Tech layoff data and trends',
    href: 'https://layoffs.fyi',
  },
  {
    icon: '🚗',
    title: 'Used Car Prices',
    subtitle: 'Manheim Index',
    description: 'Used vehicle value index',
    href: 'https://publish.manheim.com/en/services/consulting/used-vehicle-value-index.html',
  },
  {
    icon: '✈️',
    title: 'Flight Prices',
    subtitle: 'Hopper Research',
    description: 'Airfare price tracking dashboard',
    href: 'https://media.hopper.com/research',
  },
  {
    icon: '🏦',
    title: 'HedgeFollow',
    subtitle: 'Hedge Fund Positions',
    description: '13F filings & positioning',
    href: 'https://hedgefollow.com',
  },
  {
    icon: '🗺️',
    title: 'Finviz Heatmap',
    subtitle: 'Sector Map',
    description: 'Market sector performance map',
    href: 'https://finviz.com/map.ashx?t=sec_all',
  },
  {
    icon: '🏛️',
    title: 'CME FedWatch',
    subtitle: 'Rate Probability Tool',
    description: 'Full FOMC meeting probability tool',
    href: 'https://www.cmegroup.com/trading/interest-rates/countdown-to-fomc.html',
  },
  {
    icon: '📊',
    title: 'NAAIM Exposure',
    subtitle: 'NAAIM.org',
    description: 'Active manager equity exposure index',
    href: 'https://www.naaim.org/programs/naaim-exposure-index/',
  },
  {
    icon: '🌡️',
    title: 'Inflation Nowcast',
    subtitle: 'Cleveland Fed',
    description: 'Real-time CPI estimates',
    href: 'https://www.clevelandfed.org/indicators-and-data/inflation-nowcasting',
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
            className="rounded-xl border border-gray-800 bg-[#13131a] p-4 flex flex-col gap-2 hover:border-blue-500/40 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <span className="text-2xl">{link.icon}</span>
              <ExternalLink size={12} className="text-gray-700 group-hover:text-gray-400 mt-1 transition-colors" />
            </div>
            <div>
              <div className="font-semibold text-sm">{link.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{link.subtitle}</div>
            </div>
            <div className="text-xs text-gray-600 leading-tight">{link.description}</div>
          </a>
        ))}
      </div>
    </section>
  )
}
