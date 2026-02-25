import { render, screen } from '@testing-library/react'
import { FedProbability } from './FedProbability'

const mockMeetings = [
  { date: 'Mar 19', cut25: 8, hold: 88, hike25: 4 },
  { date: 'May 7', cut25: 31, hold: 62, hike25: 7 },
]

describe('FedProbability', () => {
  it('renders meeting dates', () => {
    render(<FedProbability meetings={mockMeetings} />)
    expect(screen.getByText('Mar 19')).toBeInTheDocument()
    expect(screen.getByText('May 7')).toBeInTheDocument()
  })
  it('renders hold probability', () => {
    render(<FedProbability meetings={mockMeetings} />)
    expect(screen.getByText('88%')).toBeInTheDocument()
  })
  it('renders all columns headers', () => {
    render(<FedProbability meetings={mockMeetings} />)
    expect(screen.getByText('-25bp')).toBeInTheDocument()
    expect(screen.getByText('Hold')).toBeInTheDocument()
    expect(screen.getByText('+25bp')).toBeInTheDocument()
  })
})
