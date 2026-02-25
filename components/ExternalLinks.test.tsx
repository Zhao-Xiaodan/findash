import { render, screen } from '@testing-library/react'
import { ExternalLinks } from './ExternalLinks'

describe('ExternalLinks', () => {
  it('renders layoffs card', () => {
    render(<ExternalLinks />)
    expect(screen.getAllByText(/Layoffs/i).length).toBeGreaterThanOrEqual(1)
  })
  it('renders finviz card', () => {
    render(<ExternalLinks />)
    expect(screen.getByText(/Finviz/i)).toBeInTheDocument()
  })
  it('renders HedgeFollow card', () => {
    render(<ExternalLinks />)
    expect(screen.getByText(/HedgeFollow/i)).toBeInTheDocument()
  })
  it('all links open in new tab', () => {
    render(<ExternalLinks />)
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank')
    })
  })
  it('renders 8 link cards', () => {
    render(<ExternalLinks />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(8)
  })
})
