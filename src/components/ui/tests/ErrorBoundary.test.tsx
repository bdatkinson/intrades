import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from '../ErrorBoundary'

// Suppress React error boundary logging in test output
const originalError = console.error
afterEach(() => {
  console.error = originalError
})

function BrokenComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test explosion')
  }
  return <div>All good</div>
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Working content</div>
      </ErrorBoundary>,
    )
    expect(screen.getByText('Working content')).toBeInTheDocument()
  })

  it('renders fallback UI when child throws', () => {
    console.error = vi.fn() // suppress error boundary logs
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })

  it('shows the error message', () => {
    console.error = vi.fn()
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByText(/test explosion/i)).toBeInTheDocument()
  })

  it('renders a retry button', () => {
    console.error = vi.fn()
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    )
    expect(
      screen.getByRole('button', { name: /try again/i }),
    ).toBeInTheDocument()
  })

  it('retry button resets error state', async () => {
    console.error = vi.fn()
    let shouldThrow = true

    function ToggleComponent() {
      if (shouldThrow) {
        throw new Error('Boom')
      }
      return <p>Recovered!</p>
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ToggleComponent />
      </ErrorBoundary>,
    )

    // Error UI is showing
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

    // Fix the component
    shouldThrow = false

    // Click retry
    await userEvent.click(screen.getByRole('button', { name: /try again/i }))

    // Rerender (retry forces a re-render of children)
    rerender(
      <ErrorBoundary>
        <ToggleComponent />
      </ErrorBoundary>,
    )

    // Should now show recovered content
    expect(screen.getByText('Recovered!')).toBeInTheDocument()
  })

  it('accepts a custom fallback', () => {
    console.error = vi.fn()
    render(
      <ErrorBoundary fallback={<p>Custom error UI</p>}>
        <BrokenComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Custom error UI')).toBeInTheDocument()
  })
})
