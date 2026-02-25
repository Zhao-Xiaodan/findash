import { render, screen } from '@testing-library/react'
import { WatchlistCard } from './WatchlistCard'

vi.mock('recharts', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  LineChart: ({ children }: any) => <div>{children}</div>,
  Line: () => null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}))

const mockQuote = {
  symbol: 'SPY',
  name: 'S&P 500',
  price: 598.24,
  changePercent1D: 0.82,
  changePercent5D: 2.14,
  changePercent20D: -1.30,
  sparkline: [590, 592, 595, 593, 596, 597, 598],
}

describe('WatchlistCard', () => {
  it('renders symbol and name', () => {
    render(<WatchlistCard quote={mockQuote} />)
    expect(screen.getByText('SPY')).toBeInTheDocument()
    expect(screen.getByText('S&P 500')).toBeInTheDocument()
  })
  it('renders price', () => {
    render(<WatchlistCard quote={mockQuote} />)
    expect(screen.getByText(/598/)).toBeInTheDocument()
  })
  it('shows green for positive 1D change', () => {
    render(<WatchlistCard quote={mockQuote} />)
    const change = screen.getByText(/\+0\.82%/)
    expect(change).toHaveClass('text-green-500')
  })
  it('shows red for negative 20D change', () => {
    render(<WatchlistCard quote={mockQuote} />)
    const change = screen.getByText(/-1\.30%/)
    expect(change).toHaveClass('text-red-500')
  })
})
