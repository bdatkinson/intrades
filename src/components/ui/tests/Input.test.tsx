import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../Input'

describe('Input', () => {
  it('renders input correctly with placeholder', () => {
    render(<Input placeholder="Enter your name" />)
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<Input label="Username" id="user-input" />)
    expect(screen.getByText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
  })

  it('renders helper text when provided', () => {
    render(<Input helperText="Min 8 characters" />)
    expect(screen.getByText('Min 8 characters')).toBeInTheDocument()
  })

  it('renders error message and applies red border', () => {
    render(<Input error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500')
  })

  it('disables input when disabled is true', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('handles onChange events', async () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'hello')
    
    expect(handleChange).toHaveBeenCalled()
    expect(input).toHaveValue('hello')
  })
})
