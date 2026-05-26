import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// ── Mock supabase client before importing anything that uses it ──
const mockSignInWithPassword = vi.fn()
const mockSignUp = vi.fn()
const mockSignOut = vi.fn()
const mockGetSession = vi.fn()
const mockOnAuthStateChange = vi.fn()
const mockFrom = vi.fn()
const mockInsert = vi.fn()

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
    from: mockFrom,
  },
}))

// Dynamic import after mock is established
const { AuthProvider, useAuth } = await import('../AuthProvider')

// A consumer component to read auth state in tests
function AuthConsumer() {
  const auth = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="user">{auth.user ? auth.user.email : 'null'}</span>
      <span data-testid="session">{auth.session ? 'active' : 'null'}</span>
      <button data-testid="signin" onClick={() => auth.signIn('a@b.com', 'pass')}>
        Sign In
      </button>
      <button data-testid="signup" onClick={() => auth.signUp('a@b.com', 'pass')}>
        Sign Up
      </button>
      <button data-testid="signout" onClick={() => auth.signOut()}>
        Sign Out
      </button>
      {auth.error ? <span data-testid="error">{auth.error.message}</span> : null}
    </div>
  )
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>,
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts with loading = true and no user/session', () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
    // onAuthStateChange stores the callback
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })

    renderWithProvider()

    expect(screen.getByTestId('loading').textContent).toBe('true')
    expect(screen.getByTestId('user').textContent).toBe('null')
    expect(screen.getByTestId('session').textContent).toBe('null')
  })

  it('sets user and session after getSession resolves with a session', async () => {
    const mockUser = { id: 'u1', email: 'a@b.com' }
    const mockSession = { user: mockUser, access_token: 'tok' }

    mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })

    renderWithProvider()

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })

    expect(screen.getByTestId('user').textContent).toBe('a@b.com')
    expect(screen.getByTestId('session').textContent).toBe('active')
  })

  it('signIn calls supabase.auth.signInWithPassword with email and password', async () => {
    const mockUser = { id: 'u1', email: 'a@b.com' }
    const mockSession = { user: mockUser, access_token: 'tok' }

    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
    mockSignInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    })

    renderWithProvider()

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })

    await userEvent.click(screen.getByTestId('signin'))

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pass',
    })
  })

  it('signIn sets error when signInWithPassword returns an error', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' },
    })

    renderWithProvider()

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })

    await userEvent.click(screen.getByTestId('signin'))

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('Invalid credentials')
    })
  })

  it('signUp calls supabase.auth.signUp and inserts profile row', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'u1', email: 'a@b.com' }, session: null },
      error: null,
    })

    // mock the chained from().insert() call
    mockInsert.mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ insert: mockInsert })

    renderWithProvider()

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })

    await userEvent.click(screen.getByTestId('signup'))

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pass',
    })

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('profiles')
      expect(mockInsert).toHaveBeenCalledWith({
        id: 'u1',
        username: 'a',
        role: 'apprentice',
      })
    })
  })

  it('signUp sets error when signUp fails', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
    mockSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Email already in use' },
    })

    renderWithProvider()

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })

    await userEvent.click(screen.getByTestId('signup'))

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('Email already in use')
    })
  })

  it('signOut calls supabase.auth.signOut and clears state', async () => {
    const mockUser = { id: 'u1', email: 'a@b.com' }
    const mockSession = { user: mockUser, access_token: 'tok' }

    mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
    mockSignOut.mockResolvedValue({ error: null })

    renderWithProvider()

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })

    expect(screen.getByTestId('session').textContent).toBe('active')

    await userEvent.click(screen.getByTestId('signout'))

    expect(mockSignOut).toHaveBeenCalled()

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('null')
      expect(screen.getByTestId('session').textContent).toBe('null')
    })
  })

  it('registers onAuthStateChange listener on mount and unsubscribes on unmount', () => {
    const mockUnsubscribe = vi.fn()
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    })

    const { unmount } = renderWithProvider()

    expect(mockOnAuthStateChange).toHaveBeenCalledTimes(1)

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
  })
})
