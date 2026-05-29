import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../src/features/auth/AuthProvider', () => ({
  useAuth: () => ({
    signOut: vi.fn(),
    user: null,
    loading: false,
    error: null,
  }),
}))

const { default: App } = await import('../src/App')

describe('Integration Tests - App Navigation', () => {
 it('should render the app without crashing', () => {
 render(<App/>)
 expect(screen.getByRole('main')).toBeTruthy()
 })

 it('should render all registered routes', () => {
 // TODO: implement route tests
 })

 it('should handle unknown routes gracefully', () => {
 // TODO: implement unknown route tests
 })
})
