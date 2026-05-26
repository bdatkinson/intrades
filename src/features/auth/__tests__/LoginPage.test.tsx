import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'

const mockSignIn = vi.fn()
const mockSignUp = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../AuthProvider', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signUp: mockSignUp,
    user: null,
    loading: false,
    error: null,
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const { default: LoginPage } = await import('../LoginPage')

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function renderLogin() {
    return render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )
  }

  it('renders sign in form by default', () => {
    renderLogin()

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
  })

  it('can toggle to sign up mode', async () => {
    renderLogin()

    await userEvent.click(screen.getByText(/create one/i))

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
  })

  it('can toggle back to sign in mode', async () => {
    renderLogin()

    // Go to sign up
    await userEvent.click(screen.getByText(/create one/i))
    // Go back to sign in
    await userEvent.click(screen.getByText(/sign in/i))

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })

  it('calls signIn on form submission', async () => {
    mockSignIn.mockResolvedValue(undefined)
    renderLogin()

    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'secret')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('a@b.com', 'secret')
    })
  })

  it('calls signUp on form submission in sign up mode', async () => {
    mockSignUp.mockResolvedValue(undefined)
    renderLogin()

    await userEvent.click(screen.getByText(/create one/i))

    await userEvent.type(screen.getByLabelText(/email/i), 'new@b.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'secret')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('new@b.com', 'secret')
    })
  })

  it('does not submit with empty email or password', async () => {
    renderLogin()

    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(mockSignIn).not.toHaveBeenCalled()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('shows loading state on button while submitting', async () => {
    // Make signIn hang so we can observe the loading state
    mockSignIn.mockImplementation(() => new Promise(() => {}))
    renderLogin()

    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'secret')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled()
    })
  })
})
