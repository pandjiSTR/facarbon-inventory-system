import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StockBadge from '../components/ui/StockBadge'

describe('StockBadge', () => {
  it('shows KOSONG when stock is 0', () => {
    render(<StockBadge stock={0} />)
    expect(screen.getByText('KOSONG')).toBeInTheDocument()
  })

  it('shows stock number when stock > 2', () => {
    render(<StockBadge stock={10} />)
    expect(screen.getByText('10')).toBeInTheDocument()
  })
})
