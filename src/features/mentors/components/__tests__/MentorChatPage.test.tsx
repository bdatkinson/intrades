import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import MentorChatPage from '../MentorChatPage'

// ─── Mock scrollIntoView (jsdom doesn't implement it) ─────────────

beforeEach(() => {
  if (!Element.prototype.scrollIntoView) {
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      value: () => {},
      writable: true,
      configurable: true,
    })
  }
})

// ─── Helpers ─────────────────────────────────────────────────────

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/mentors/:id/chat" element={<MentorChatPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

// ─── Tests ───────────────────────────────────────────────────────

describe('MentorChatPage', () => {
  it('renders the page container', () => {
    renderAt('/mentors/iron-thorne/chat')
    expect(screen.getByTestId('mentor-chat')).toBeInTheDocument()
  })

  it('renders "Back to Detail" link', () => {
    renderAt('/mentors/iron-thorne/chat')
    expect(
      screen.getByRole('link', { name: /back to/i }),
    ).toBeInTheDocument()
  })

  it('renders the greeting message from mentor', () => {
    renderAt('/mentors/iron-thorne/chat')
    // The greeting should contain text from Iron's opening
    expect(
      screen.getByText(/what keeps steel standing/i),
    ).toBeInTheDocument()
  })

  it('shows not-found message for invalid mentor id', () => {
    renderAt('/mentors/nonexistent/chat')
    expect(
      screen.getByText(/mentor not found/i),
    ).toBeInTheDocument()
  })
})
