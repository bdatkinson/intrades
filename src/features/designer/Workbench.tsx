import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDesignerStore } from '../../store/designerStore'
import { SuitColumn } from '../../components/designer/SuitColumn'
import { SUITS } from '../../lib/cards/types'
import { downloadIntc } from '../../lib/cards/intc'
import type { Suit } from '../../lib/cards/types'

/**
 * Workbench — the instructor designer surface.
 *
 * Layout: 4 vertical suit columns over a bottom-right floating dock.
 * Keybindings: Cmd/Ctrl-Z (undo), Cmd/Ctrl-Shift-Z (redo).
 * Dock: Preview as Student | Share | Export | Undo.
 * Design: OSHA placard / machine-label — no shadows, no gradients, hard corners.
 */
export function Workbench() {
  const undo = useDesignerStore((s) => s.undo)
  const redo = useDesignerStore((s) => s.redo)
  const cards = useDesignerStore((s) => s.cards)
  const undoDepth = useDesignerStore((s) => s.undoStack.length)
  const navigate = useNavigate()

  const [shareOpen, setShareOpen] = useState(false)

  // ─── Global keyboard shortcuts ────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (!mod || e.key !== 'z') return

      // Prevent browser undo/redo
      e.preventDefault()

      if (e.shiftKey) {
        redo()
      } else {
        undo()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  // ─── Action handlers ──────────────────────────────────────────

  const handlePreview = () => {
    // Push current cards to sessionStorage so Showcase on /deck can read them.
    sessionStorage.setItem('intrades-preview-cards', JSON.stringify(cards))
    navigate('/deck')
  }

  const handleShareRemix = () => {
    // Download the deck as a .intc file for remixing.
    console.log('[Workbench] Share for Remix (.intc) — downloading deck bundle')
    downloadIntc(cards, { name: 'InTrades Deck', author: 'Instructor' }, 'deck.intc')
    setShareOpen(false)
  }

  const handleSharePrompt = () => {
    // Export underlying Socratic rounds as markdown prompt.
    // Stub: full prompt export is a future feature (S-03).
    console.log('[Workbench] Share as Prompt (.md) — stub: prompt export not yet wired')
    setShareOpen(false)
  }

  const handleExport = () => {
    // Download the full deck as a .intc bundle.
    console.log('[Workbench] Export — downloading deck as .intc bundle')
    downloadIntc(cards, { name: 'InTrades Deck', author: 'Instructor' }, 'deck.intc')
  }

  return (
    <div className="bg-slate-950 text-slate-200 font-sans">
      {/* ─── Accessibility: Skip link ─────────────────────────── */}
      <a href="#card-grid" className="skip-link">
        Skip to card grid
      </a>

      {/* ─── Screen-reader help text ──────────────────────── */}
      <p className="sr-only">
        Use tab to move through cards. Arrow keys reorder within a column. Enter
        opens the card detail sidebar. ESC closes the sidebar.
      </p>

      {/* ─── Suit Columns ───────────────────────────────────── */}
      <main className="p-4 pb-24">
        <div
          id="card-grid"
          aria-label="Card Designer Workbench"
          className="grid grid-cols-4 gap-4 max-w-[960px] mx-auto"
        >
          {SUITS.map((suit: Suit) => (
            <SuitColumn key={suit} suit={suit} />
          ))}
        </div>
      </main>

      {/* ─── CARD-W07: Floating Dock ──────────────────────────── */}
      <div
        data-testid="designer-dock"
        role="navigation"
        aria-label="Designer actions"
        className="
          fixed bottom-4 right-4 z-50
          bg-slate-900 border border-slate-700
          flex flex-col gap-1 p-2
          notch-top-left
        "
        style={{
          clipPath: 'polygon(12px 0, 100% 0, 100% 100%, 0 100%, 0 12px)',
        }}
      >
        {/* Preview as Student */}
        <button
          type="button"
          onClick={handlePreview}
          aria-label="Preview as Student"
          title="Preview as Student"
          className="
            font-mono text-xs uppercase tracking-wider px-3 py-2
            border border-emerald-800 bg-emerald-950/30 text-emerald-400
            hover:bg-emerald-900/30 cursor-pointer
          "
        >
          Preview
        </button>

        {/* Share (with dropdown) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShareOpen((o) => !o)}
            aria-label="Share"
            title="Share deck"
            aria-haspopup="true"
            aria-expanded={shareOpen}
            className="
              w-full font-mono text-xs uppercase tracking-wider px-3 py-2
              border border-sky-800 bg-sky-950/30 text-sky-400
              hover:bg-sky-900/30 cursor-pointer
            "
          >
            Share
          </button>

          {shareOpen && (
            <div
              data-testid="share-menu"
              className="
                absolute bottom-full right-0 mb-1 w-48
                bg-slate-900 border border-slate-700
                flex flex-col gap-0
              "
              style={{
                clipPath: 'polygon(12px 0, 100% 0, 100% 100%, 0 100%, 0 12px)',
              }}
            >
              <button
                type="button"
                onClick={handleShareRemix}
                className="
                  text-left font-mono text-xs px-3 py-2
                  text-slate-300 hover:bg-slate-800 cursor-pointer
                  border-b border-slate-800
                "
              >
                Share for Remix (.intc)
              </button>
              <button
                type="button"
                onClick={handleSharePrompt}
                className="
                  text-left font-mono text-xs px-3 py-2
                  text-slate-300 hover:bg-slate-800 cursor-pointer
                "
              >
                Share as Prompt (.md)
              </button>
            </div>
          )}
        </div>

        {/* Export */}
        <button
          type="button"
          onClick={handleExport}
          aria-label="Export"
          title="Export deck as .intc"
          className="
            font-mono text-xs uppercase tracking-wider px-3 py-2
            border border-slate-700 bg-slate-800/50 text-slate-300
            hover:bg-slate-700/50 cursor-pointer
          "
        >
          Export
        </button>

        {/* Undo */}
        <button
          type="button"
          onClick={undo}
          disabled={undoDepth === 0}
          aria-label={`Undo${undoDepth > 0 ? ` (${undoDepth})` : ''}`}
          className={`
            font-mono text-xs uppercase tracking-wider px-3 py-2
            border-2 rounded-none transition-none
            ${
              undoDepth > 0
                ? 'border-amber-600 bg-amber-950/40 text-amber-400 hover:bg-amber-900/40 cursor-pointer'
                : 'border-slate-800 bg-slate-900 text-slate-600 cursor-not-allowed'
            }
          `}
        >
          Undo{undoDepth > 0 ? ` (${undoDepth})` : ''}
        </button>
      </div>
    </div>
  )
}
