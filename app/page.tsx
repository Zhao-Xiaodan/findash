import { WatchlistSection } from '@/components/WatchlistSection'
import { SentimentSection } from '@/components/SentimentSection'
import { FedSection } from '@/components/FedSection'
import { MacroSection } from '@/components/MacroSection'

export default function Home() {
  return (
    <div className="space-y-4">
      <WatchlistSection />
      <SentimentSection />
      <FedSection />
      <MacroSection />
    </div>
  )
}
