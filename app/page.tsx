import { WatchlistSection } from '@/components/WatchlistSection'
import { SentimentSection } from '@/components/SentimentSection'
import { VolatilitySection } from '@/components/VolatilitySection'
import { FedSection } from '@/components/FedSection'
import { MacroSection } from '@/components/MacroSection'
import { ExternalLinks } from '@/components/ExternalLinks'
import { SectionDivider } from '@/components/SectionDivider'

export default function Home() {
  return (
    <div>
      <WatchlistSection />
      <SectionDivider />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SentimentSection />
        <VolatilitySection />
      </div>
      <SectionDivider />
      <FedSection />
      <SectionDivider />
      <MacroSection />
      <SectionDivider />
      <ExternalLinks />
    </div>
  )
}
