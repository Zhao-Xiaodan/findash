import { render, screen } from '@testing-library/react'
import { FearGreedGauge } from './FearGreedGauge'

describe('FearGreedGauge', () => {
  it('displays the score', () => {
    render(<FearGreedGauge score={27} rating="fear" />)
    expect(screen.getByText('27')).toBeInTheDocument()
  })
  it('displays the rating label', () => {
    render(<FearGreedGauge score={27} rating="fear" />)
    expect(screen.getByText(/fear/i)).toBeInTheDocument()
  })
  it('displays extreme greed correctly', () => {
    render(<FearGreedGauge score={85} rating="extreme greed" />)
    expect(screen.getByText('85')).toBeInTheDocument()
  })
})
