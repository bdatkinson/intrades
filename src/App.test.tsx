import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the InTrades heading', () => {
    render(<App />)
    expect(screen.getByText('InTrades')).toBeInTheDocument()
  })

  it('renders the welcome message', () => {
    render(<App />)
    expect(screen.getByText('Welcome to InTrades')).toBeInTheDocument()
  })

  it('renders all four feature cards', () => {
    render(<App />)
    expect(screen.getByText('Mentor Cards')).toBeInTheDocument()
    expect(screen.getByText('Job Agent')).toBeInTheDocument()
    expect(screen.getByText('Cost Estimator')).toBeInTheDocument()
    expect(screen.getByText('Daily Closeout')).toBeInTheDocument()
  })
})
