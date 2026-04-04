import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterBar } from '../FilterBar'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

describe('FilterBar', () => {
  it('renders search input', () => {
    render(<FilterBar filters={{}} onChange={jest.fn()} />)
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('renders Type select', () => {
    render(<FilterBar filters={{}} onChange={jest.fn()} />)
    expect(screen.getByRole('combobox', { name: /type/i })).toBeInTheDocument()
  })

  it('calls onChange when type changes', async () => {
    const onChange = jest.fn()
    render(<FilterBar filters={{}} onChange={onChange} />)
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /type/i }), 'rocky')
    expect(onChange).toHaveBeenCalled()
  })
})
