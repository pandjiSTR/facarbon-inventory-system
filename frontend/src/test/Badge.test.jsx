import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Badge from '../components/ui/Badge'

describe('Badge', () => {
  it('renders forged badge', () => {
    render(<Badge type="forged" />)
    expect(screen.getByText('Forged')).toBeInTheDocument()
  })

  it('renders twill badge', () => {
    render(<Badge type="twill" />)
    expect(screen.getByText('Twill')).toBeInTheDocument()
  })
})
