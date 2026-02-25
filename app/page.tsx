import { WatchlistSection } from '@/components/WatchlistSection'
import { SentimentSection } from '@/components/SentimentSection'
import { VolatilitySection } from '@/components/VolatilitySection'
import { FedSection } from '@/components/FedSection'
import { MacroSection } from '@/components/MacroSection'
import { ExternalLinks } from '@/components/ExternalLinks'

export default function Home() {
  return (
    <div className="space-y-4">
      <WatchlistSection />
      <SentimentSection />
      <VolatilitySection />
      <FedSection />
      <MacroSection />
      <ExternalLinks />
    </div>
  )
}
