import { render, screen } from '@testing-library/react'
import { SentimentBar } from './SentimentBar'

describe('SentimentBar', () => {
  it('renders bull/bear/neutral labels', () => {
    render(<SentimentBar bullish={42} neutral={30} bearish={28} spread={14} updatedNote="Weekly" />)
    expect(screen.getByText(/bulls/i)).toBeInTheDocument()
    expect(screen.getByText(/bears/i)).toBeInTheDocument()
    expect(screen.getByText(/neutral/i)).toBeInTheDocument()
  })
  it('shows positive spread value', () => {
    render(<SentimentBar bullish={42} neutral={30} bearish={28} spread={14} updatedNote="Weekly" />)
    expect(screen.getByText('+14')).toBeInTheDocument()
  })
  it('shows negative spread correctly', () => {
    render(<SentimentBar bullish={20} neutral={30} bearish={50} spread={-30} updatedNote="Weekly" />)
    expect(screen.getByText('-30')).toBeInTheDocument()
  })
})
