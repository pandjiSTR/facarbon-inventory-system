import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Package } from 'lucide-react'
import StatCard from '../components/ui/StatCard'

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard icon={Package} label="Total Produk" value="42" />)
    expect(screen.getByText('Total Produk')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })
})
