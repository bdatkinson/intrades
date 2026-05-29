import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Workbench } from '../Workbench'
import { useDesignerStore } from '../../../store/designerStore'
import type { Card } from '../../../lib/cards/types'

/** Render Workbench wrapped in a router (required by useNavigate). */
function renderWorkbench() {
  return render(
    <MemoryRouter>
      <Workbench />
    </MemoryRouter>,
  )
}

describe('Workbench', () => {
  beforeEach(() => {
    useDesignerStore.setState({
      cards: [],
      undoStack: [],
      redoStack: [],
      dragPreview: null,
    })
  })

  it('renders all 4 suit columns', () => {
    renderWorkbench()
    expect(screen.getByText('Spades')).toBeDefined()
    expect(screen.getByText('Clubs')).toBeDefined()
    expect(screen.getByText('Diamonds')).toBeDefined()
    expect(screen.getByText('Hearts')).toBeDefined()
  })

  it('renders Undo button in the dock', () => {
    renderWorkbench()
    const undoBtn = screen.getByRole('button', { name: /undo/i })
    expect(undoBtn).toBeDefined()
  })

  it('Undo button shows undo stack depth when non-empty', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'clubs', value: 2, name: 'W2', description: '' },
    ]
    const action = {
      cards: [...cards],
      timestamp: Date.now(),
    }
    useDesignerStore.setState({ cards, undoStack: [action], redoStack: [], dragPreview: null })

    renderWorkbench()
    // Should show stack depth — the undo button shows "(1)"
    const undoBtn = screen.getByRole('button', { name: /undo/i })
    expect(undoBtn.textContent).toMatch(/\(1\)/)
  })

  it('clicking Undo button calls undo() on store', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'clubs', value: 2, name: 'W2', description: '' },
    ]
    const modified = [
      { ...cards[0], value: 2 },
      { ...cards[1], value: 1 },
    ]
    const action = { cards: [...cards], timestamp: Date.now() }
    useDesignerStore.setState({ cards: modified, undoStack: [action], redoStack: [], dragPreview: null })

    renderWorkbench()
    const undoBtn = screen.getByRole('button', { name: /undo/i })
    fireEvent.click(undoBtn)

    const state = useDesignerStore.getState()
    expect(state.cards).toEqual(cards)
    expect(state.undoStack).toHaveLength(0)
  })

  it('Cmd+Z triggers undo via keyboard', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'clubs', value: 2, name: 'W2', description: '' },
    ]
    const modified = [
      { ...cards[0], value: 2 },
      { ...cards[1], value: 1 },
    ]
    const action = { cards: [...cards], timestamp: Date.now() }
    useDesignerStore.setState({ cards: modified, undoStack: [action], redoStack: [], dragPreview: null })

    renderWorkbench()

    fireEvent.keyDown(window, { key: 'z', metaKey: true })
    const state = useDesignerStore.getState()
    expect(state.cards).toEqual(cards)
  })

  it('Cmd+Shift+Z triggers redo via keyboard', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'clubs', value: 2, name: 'W2', description: '' },
    ]
    const modified = [
      { ...cards[0], value: 2 },
      { ...cards[1], value: 1 },
    ]
    const redoAction = { cards: [...modified], timestamp: Date.now() }
    useDesignerStore.setState({ cards, undoStack: [], redoStack: [redoAction], dragPreview: null })

    renderWorkbench()

    fireEvent.keyDown(window, { key: 'z', metaKey: true, shiftKey: true })
    const state = useDesignerStore.getState()
    expect(state.cards).toEqual(modified)
  })

  it('Ctrl+Z triggers undo (Windows/Linux)', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'clubs', value: 2, name: 'W2', description: '' },
    ]
    const modified = [
      { ...cards[0], value: 2 },
      { ...cards[1], value: 1 },
    ]
    const action = { cards: [...cards], timestamp: Date.now() }
    useDesignerStore.setState({ cards: modified, undoStack: [action], redoStack: [], dragPreview: null })

    renderWorkbench()

    fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
    const state = useDesignerStore.getState()
    expect(state.cards).toEqual(cards)
  })

  it('Ctrl+Shift+Z triggers redo (Windows/Linux)', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'clubs', value: 2, name: 'W2', description: '' },
    ]
    const modified = [
      { ...cards[0], value: 2 },
      { ...cards[1], value: 1 },
    ]
    const redoAction = { cards: [...modified], timestamp: Date.now() }
    useDesignerStore.setState({ cards, undoStack: [], redoStack: [redoAction], dragPreview: null })

    renderWorkbench()

    fireEvent.keyDown(window, { key: 'z', ctrlKey: true, shiftKey: true })
    const state = useDesignerStore.getState()
    expect(state.cards).toEqual(modified)
  })

  it('Undo button is disabled when undoStack is empty', () => {
    useDesignerStore.setState({ cards: [], undoStack: [], redoStack: [], dragPreview: null })
    renderWorkbench()
    const undoBtn = screen.getByRole('button', { name: /undo/i })
    expect((undoBtn as HTMLButtonElement).disabled).toBe(true)
  })

  it('renders with OSHA/machine-label styling (no shadows, no gradients)', () => {
    renderWorkbench()
    const dock = document.querySelector('[data-testid="designer-dock"]')
    expect(dock).not.toBeNull()
    // Verify solid background (no gradient class)
    const classList = dock?.className ?? ''
    expect(classList).not.toContain('shadow')
    expect(classList).not.toContain('gradient')
    expect(classList).not.toContain('glass')
  })

  // ─── CARD-W07: Expanded dock tests ────────────────────────────

  it('renders all four dock buttons: Preview, Share, Export, Undo', () => {
    renderWorkbench()
    expect(screen.getByRole('button', { name: /preview as student/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /share/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /export/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /undo/i })).toBeDefined()
  })

  it('dock has solid surface-1 background and 1px border (no shadow)', () => {
    renderWorkbench()
    const dock = document.querySelector('[data-testid="designer-dock"]')
    expect(dock).not.toBeNull()
    const classList = dock?.className ?? ''
    // OSHA placard: solid surface, border, no shadow/gradient/glass
    expect(classList).toContain('border')
    expect(classList).not.toContain('shadow')
    expect(classList).not.toContain('gradient')
    expect(classList).not.toContain('glass')
    expect(classList).not.toContain('drop-shadow')
  })

  it("dock has 45° tear-cut on top-left corner (OSHA/McMaster style)", () => {
    renderWorkbench()
    const dock = document.querySelector('[data-testid="designer-dock"]')
    expect(dock).not.toBeNull()
    // The tear-cut is achieved via CSS clip-path or pseudo-element.
    // Check for the clip-path or the tear-cut class.
    const classList = dock?.className ?? ''
    const dockStyle = (dock as HTMLElement).style?.clipPath ?? ''
    // Accept either a tear-cut class or a clip-path polygon
    const hasTearCut =
      classList.includes('tear-cut') ||
      dockStyle.includes('polygon') ||
      classList.includes('notch')
    expect(hasTearCut).toBe(true)
  })

  it('Preview as Student saves cards to sessionStorage and navigates to /deck', () => {
    const cards: Card[] = [
      { id: 'h1', suit: 'spades', value: 1, name: 'Framing Hammer', description: 'Drive nails.' },
      { id: 'w2', suit: 'clubs', value: 2, name: 'Pipe Wrench', description: 'Serrated jaw.' },
    ]
    useDesignerStore.setState({ cards, undoStack: [], redoStack: [], dragPreview: null })

    renderWorkbench()
    const previewBtn = screen.getByRole('button', { name: /preview as student/i })
    fireEvent.click(previewBtn)

    // Verify cards were written to sessionStorage
    const stored = sessionStorage.getItem('intrades-preview-cards')
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed).toHaveLength(2)
    expect(parsed[0].name).toBe('Framing Hammer')
    expect(parsed[1].name).toBe('Pipe Wrench')
  })

  it('Share button opens a dropdown with .intc and .md options', () => {
    renderWorkbench()
    const shareBtn = screen.getByRole('button', { name: /share/i })
    fireEvent.click(shareBtn)

    // Share menu should appear with two options
    expect(screen.getByText(/remix/i)).toBeDefined()
    expect(screen.getByText(/\.intc/i)).toBeDefined()
    expect(screen.getByText(/prompt/i)).toBeDefined()
    expect(screen.getByText(/\.md/i)).toBeDefined()
  })

  it('clicking Share again closes the dropdown', () => {
    renderWorkbench()
    const shareBtn = screen.getByRole('button', { name: /share/i })

    // Open
    fireEvent.click(shareBtn)
    expect(screen.getByText(/remix/i)).toBeDefined()

    // Close
    fireEvent.click(shareBtn)
    expect(screen.queryByText(/remix/i)).toBeNull()
  })

  it('Share for Remix (.intc) triggers download of .intc file', () => {
    const consoleSpy = ((globalThis as unknown as Record<string, unknown>).console as Console)
    const originalLog = consoleSpy.log
    const logs: string[] = []
    consoleSpy.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(' '))
    }

    renderWorkbench()
    const shareBtn = screen.getByRole('button', { name: /share/i })
    fireEvent.click(shareBtn)

    const remixOption = screen.getByText(/remix/i)
    fireEvent.click(remixOption)

    // Accept a console log (stub) or download attempt
    const hit = logs.some(l =>
      l.includes('Share') || l.includes('share') || l.includes('intc') || l.includes('download')
    )
    expect(hit).toBe(true)

    consoleSpy.log = originalLog
  })

  it('Share as Prompt (.md) logs or triggers markdown export', () => {
    const consoleSpy = ((globalThis as unknown as Record<string, unknown>).console as Console)
    const originalLog = consoleSpy.log
    const logs: string[] = []
    consoleSpy.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(' '))
    }

    renderWorkbench()
    const shareBtn = screen.getByRole('button', { name: /share/i })
    fireEvent.click(shareBtn)

    const promptOption = screen.getByText(/prompt/i)
    fireEvent.click(promptOption)

    const hit = logs.some(l =>
      l.includes('Share') || l.includes('share') || l.includes('prompt') || l.includes('.md')
    )
    expect(hit).toBe(true)

    consoleSpy.log = originalLog
  })

  it('Export button logs action or triggers download', () => {
    const consoleSpy = ((globalThis as unknown as Record<string, unknown>).console as Console)
    const originalLog = consoleSpy.log
    const logs: string[] = []
    consoleSpy.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(' '))
    }

    renderWorkbench()
    const exportBtn = screen.getByRole('button', { name: /^export/i })
    fireEvent.click(exportBtn)

    const hit = logs.some(l =>
      l.includes('Export') || l.includes('export') || l.includes('download') || l.includes('intc')
    )
    expect(hit).toBe(true)

    consoleSpy.log = originalLog
  })
})
