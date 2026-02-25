/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react'
import { MacroChart } from './MacroChart'

vi.mock('recharts', () => ({
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  defs: () => null,
  linearGradient: () => null,
  stop: () => null,
}))

const mockData = [
  { date: '2024-01-01', value: 4.2 },
  { date: '2024-02-01', value: 3.9 },
  { date: '2024-03-01', value: 4.1 },
]

describe('MacroChart', () => {
  it('renders chart title', () => {
    render(<MacroChart title="HY Credit Spread" data={mockData} unit="%" />)
    expect(screen.getByText('HY Credit Spread')).toBeInTheDocument()
  })
  it('shows latest value', () => {
    render(<MacroChart title="HY Credit Spread" data={mockData} unit="%" />)
    expect(screen.getByText(/4\.10/)).toBeInTheDocument()
  })
  it('shows unit', () => {
    render(<MacroChart title="HY Credit Spread" data={mockData} unit="%" />)
    expect(screen.getByText('%')).toBeInTheDocument()
  })
})
